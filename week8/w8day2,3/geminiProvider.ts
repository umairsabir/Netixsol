import {
  ModelProvider,
  Model,
  ModelRequest,
  ModelResponse,
  protocol,
  SerializedTool,
  SerializedHandoff
} from "@openai/agents-core";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

// Gemini doesn't support some JSON Schema fields that OpenAI uses.
// This helper strips them recursively before sending to the API.
function cleanSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') return schema;
  const cleaned: any = {};
  for (const [key, value] of Object.entries(schema)) {
    // Fields Gemini does NOT support
    if (['additionalProperties', '$schema', 'default'].includes(key)) continue;
    if (Array.isArray(value)) {
      cleaned[key] = value.map(cleanSchema);
    } else if (typeof value === 'object') {
      cleaned[key] = cleanSchema(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export class GeminiModel implements Model {
  name = "gemini-2.0-flash"; // default

  constructor(name?: string) {
    if (name) this.name = name;
  }

  async getResponse(request: ModelRequest): Promise<ModelResponse> {
    // 1. Format messages
    const contents: any[] = [];
    let systemInstruction: any = undefined;

    if (request.systemInstructions) {
      // Extract agent name from first line of instructions for logging
      const agentName = request.systemInstructions.split('\n')[0].replace('You are ', '').split('.')[0];
      console.log(`\n[Agent Call] Activating: ${agentName}...`);
      systemInstruction = {
        parts: [{ text: request.systemInstructions }]
      };
    }

    if (Array.isArray(request.input)) {
      for (const item of request.input) {
        if (item.type === 'message' || !item.type) {
          const msgItem = item as any;
          if (msgItem.role === 'user') {
            const text = typeof msgItem.content === 'string' 
              ? msgItem.content 
              : Array.isArray(msgItem.content) ? msgItem.content.map((c: any) => c.text || '').join('') : '';
            contents.push({ role: 'user', parts: [{ text }] });
          } else if (msgItem.role === 'assistant') {
            // Check if we have original Gemini parts in providerData
            if (msgItem.providerData?.geminiParts) {
              contents.push({ role: 'model', parts: msgItem.providerData.geminiParts });
            } else {
              const text = Array.isArray(msgItem.content) 
                ? msgItem.content.map((c: any) => c.text || '').join('') 
                : '';
              if (text) {
                contents.push({ role: 'model', parts: [{ text }] });
              }
            }
          }
        } else if (item.type === 'function_call') {
          // If this function call was part of a Gemini turn with multiple parts (like thoughts),
          // we should have preserved them in providerData.
          if (item.providerData?.geminiParts) {
            contents.push({ role: 'model', parts: item.providerData.geminiParts });
          } else {
            contents.push({
              role: 'model',
              parts: [{
                functionCall: {
                  name: item.name,
                  args: item.arguments ? JSON.parse(item.arguments) : {}
                }
              }]
            });
          }
        } else if (item.type === 'function_call_result') {
          contents.push({
            role: 'user', 
            parts: [{
              functionResponse: {
                name: item.name,
                response: { result: typeof item.output === 'string' ? item.output : JSON.stringify(item.output) }
              }
            }]
          });
        }
      }
    } else if (typeof request.input === 'string') {
      contents.push({ role: 'user', parts: [{ text: request.input }] });
    }

    // 2. Format tools (including handoffs)
    let functionDeclarations: any[] = [];

    if (request.tools) {
      for (const tool of request.tools) {
        if (tool.type === 'function') {
          functionDeclarations.push({
            name: tool.name,
            description: tool.description,
            parameters: cleanSchema(tool.parameters)
          });
        }
      }
    }

    if (request.handoffs) {
      for (const handoff of request.handoffs) {
        functionDeclarations.push({
          name: handoff.toolName,
          description: handoff.toolDescription,
          parameters: cleanSchema(handoff.inputJsonSchema) || { type: 'object', properties: {} }
        });
      }
    }

    const payload: any = { contents };
    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }
    if (functionDeclarations.length > 0) {
      payload.tools = [{ functionDeclarations }];
    }

    // 3. Call Gemini REST API
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.name}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];

    // 4. Parse Response back to ModelResponse
    if (candidate?.content?.parts) {
      const toolCalls = candidate.content.parts
        .filter((p: any) => p.functionCall)
        .map((p: any) => ({
          id: `call_${Math.random().toString(36).substring(7)}`,
          type: "function",
          function: {
            name: p.functionCall.name,
            arguments: JSON.stringify(p.functionCall.args || {})
          }
        }));

      if (toolCalls.length > 0) {
        const tc = toolCalls[0];
        if (tc.function.name.includes('transfer_to_')) {
          const target = tc.function.name.replace('transfer_to_', '').replace('_', ' ');
          console.log(`[Handoff] Requesting transfer to: ${target}`);
        } else {
          console.log(`[Tool Call] Requesting tool: ${tc.function.name} with args: ${tc.function.arguments}`);
        }
        return {
          output: [
            {
              type: "function_call",
              callId: toolCalls[0].id,
              name: toolCalls[0].function.name,
              arguments: toolCalls[0].function.arguments,
              providerData: { geminiParts: candidate.content.parts } // PRESERVE ALL PARTS
            } as any
          ],
          usage: {} as any
        } as unknown as ModelResponse;
      }

      const text = candidate.content.parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join("\n");

      if (text) {
        return {
          output: [
            {
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text }],
              providerData: { geminiParts: candidate.content.parts } // PRESERVE ALL PARTS
            } as any
          ],
          usage: {} as any
        } as unknown as ModelResponse;
      }
    }

    throw new Error("Unexpected empty response from Gemini");
  }

  // Required by Model interface
  async *getStreamedResponse(request: ModelRequest) {
    throw new Error("Streaming not implemented");
  }
}

export class GeminiProvider implements ModelProvider {
  getModel(modelName?: string): Model {
    return new GeminiModel(modelName || "gemini-2.0-flash");
  }
}

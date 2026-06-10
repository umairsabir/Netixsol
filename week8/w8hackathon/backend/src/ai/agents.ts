import { Agent } from '@openai/agents';
import { groq } from './groq';
import { aisdk } from '@openai/agents-extensions/ai-sdk';
import { pdfExtractionTool, chunkRetrieverTool, sectionLocatorTool } from './tools';

const MODEL = aisdk(groq('llama-3.3-70b-versatile'));

export const createAgents = () => {
  // 1. Document Analysis Agent
  const analysisAgent = new Agent({
    name: 'Document Analysis Agent',
    model: MODEL,
    tools: [pdfExtractionTool, sectionLocatorTool],
    instructions: `You are an expert document analyst.
    
    The document content is provided in your context under [Document Content].
    Analyze the provided text and identify:
    - Document type (Research Paper, Report, Legal Document, Manual/Guide, etc.)
    - Key sections and structure
    - Important entities (people, organizations, dates, key terms)
    
    OUTPUT FORMAT: Provide a structured analysis with clear sections.`,
  });

  // 2. Summary Agent
  const summaryAgent = new Agent({
    name: 'Summary Agent',
    model: MODEL,
    tools: [chunkRetrieverTool],
    instructions: `You are a professional summarizer.
    
    The document content is provided in your context under [Document Content].
    Based on the provided text, generate:
    - Document type identification (one line)
    - Executive summary (max 3 paragraphs)
    - Exactly 5 key highlights as bullet points
    - Key entities mentioned
    
    OUTPUT FORMAT (STRICT):
    TYPE: [Document Type]
    EXECUTIVE SUMMARY: [Summary text]
    HIGHLIGHTS:
    - [Point 1]
    - [Point 2]
    - [Point 3]
    - [Point 4]
    - [Point 5]
    ENTITIES: [comma-separated list]`,
  });

  // 3. Q&A Agent
  const qaAgent = new Agent({
    name: 'Q&A Agent',
    model: MODEL,
    tools: [chunkRetrieverTool, sectionLocatorTool],
    instructions: `You are a specialized Q&A assistant for document analysis.
    
    The document content is provided in your context under [Document Content].
    The user's question is provided under [User Question].
    
    CRITICAL RULES:
    1. Answer STRICTLY based on the provided document content
    2. If the answer is not in the document, respond EXACTLY: "This information is not present in the document."
    3. Do NOT use external knowledge
    4. Do NOT hallucinate or make up information
    5. Provide specific citations when possible (e.g., "According to the document...")
    
    If the user asks something unrelated to the document (like weather, personal questions, etc.), 
    respond: "I can only answer questions about the uploaded document."`,
  });

  // 4. Router Agent
  const routerAgent = new Agent({
    name: 'Router Agent',
    model: MODEL,
    instructions: `### CRITICAL INSTRUCTION: CLEAN HANDOFFS ONLY ###
    You are the primary triage assistant. You decide which agent should handle the request.
    
    GUIDELINES:
    1. Identify user intent from the question.
    2. Route to the correct agent using 'transfer_to' tools.
    3. IMPORTANT: The 'transfer_to' tools take NO ARGUMENTS.
       ❌ DO NOT pass questions, text, or paths into these tools.
       ❌ DO NOT include any fields like 'question' or 'document_content'.
       ✅ Just call the tool with an empty object {}.
    
    ROUTING RULES:
    - Use 'transfer_to_Summary_Agent' for analysis/summary/highlights requests (e.g., "Analyze this", "Summarize", "What type of document is this").
    - Use 'transfer_to_Q_A_Agent' for specific content questions (e.g., "What does section 2 say?", "Who is mentioned in the document?").
    
    The document content is already provided in the context for all agents.`,
    handoffs: [analysisAgent, summaryAgent, qaAgent],
  });

  return { routerAgent, analysisAgent, summaryAgent, qaAgent };
};

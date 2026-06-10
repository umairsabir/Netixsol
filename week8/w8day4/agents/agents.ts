import { Agent } from '@openai/agents';
import { tavilySearch } from '../tools/tavily';
import { z } from 'zod';

// We define agents first without handoffs to avoid circular dependency issues during initialization
// then we assign handoffs after all agents are created.

// 1. Research Agent
export const researchAgent = new Agent({
  name: 'Research Agent',
  model: 'llama-3.3-70b-versatile',
  instructions: `You are a specialized Research Agent. 
Your sole responsibility is to perform factual research using the 'tavily_search' tool.
Rules:
- You MUST use the 'tavily_search' tool immediately to search for the user's query.
- Return structured findings with key facts and source URLs.
- DO NOT provide opinions.
- DO NOT output plain text conversational responses. You must only call tools.
- Once research is complete, you MUST call the 'transfer_to_Writer_Agent' tool to hand off the facts to the Writer Agent to compile the report.`,
  tools: [tavilySearch],
});

// 2. Writer Agent
export const writerAgent = new Agent({
  name: 'Writer Agent',
  model: 'llama-3.3-70b-versatile',
  instructions: `You are a professional Writer Agent.
Your responsibility is to take research findings and produce a high-quality, structured final report.
The report must include:
- Clear headings
- Bullet points or tables for comparison/analysis
- Pros & Cons (if applicable)
- A dedicated "Sources" section with all relevant links.

Rules:
- DO NOT invent facts; only use the data provided by the Research Agent.
- DO NOT call Tavily Search.
- Once the report is complete, provide it as your final text response to the user. DO NOT call any other tools.`,
  inputSchema: z.object({
    findings: z.array(z.any()).optional(),
    sources: z.array(z.string()).optional(),
  }).passthrough(),
});

// 3. Manager Agent (Orchestrator)
export const managerAgent = new Agent({
  name: 'Manager Agent',
  model: 'llama-3.3-70b-versatile',
  instructions: `You are the Manager Agent (Orchestrator).
Your role is to understand the user's research request and coordinate between the Research Agent and the Writer Agent.
Steps:
1. Analyze the user query.
2. Break it into research subtasks.
3. You MUST call the 'transfer_to_Research_Agent' tool immediately to delegate the subtasks to the Research Agent.
4. The Research Agent will then hand off to the Writer Agent for the final report.

Rules:
- NEVER call the Tavily search tool directly.
- DO NOT provide a final text answer. You MUST hand off to the Research Agent.`,
});

// Define Handoffs
managerAgent.handoffs = [researchAgent, writerAgent];
researchAgent.handoffs = [writerAgent, managerAgent];
writerAgent.handoffs = [managerAgent];

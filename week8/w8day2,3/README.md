# Day 31 – Agentic AI Introduction
## Multi-Agent CLI Assistant using OpenAI Agents SDK

---

## Setup Instructions

### 1. Clone / Download the project
```bash
cd day-31-ai-agents-intro
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Create `.env` file
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the project
```bash
pnpm start
```

### 5. Exit the app
Type `exit` or `quit` in the terminal.

---

## How to Run

```
pnpm start
```

The CLI will show:
```
==========================================
🤖 Multi-Agent CLI Assistant Initialized
==========================================
You:
```

Type any message and press Enter. The system will automatically route your query to the correct agent.

**Example inputs:**
- `what is 25 * 48` → goes to Math Agent
- `count words in: Hello world this is a test` → goes to Programming Agent
- `how do I reverse a string in Python` → goes to Programming Agent
- `tell me a dirty joke` → Guardrail blocks it

---

## Agent Roles

### 1. Router Agent
- Entry point for every user message
- Analyzes the input and decides which agent should handle it
- **Never answers directly** — always hands off to a specialist
- Contains **Guardrail logic**: blocks inappropriate, unsafe, or non-work-related queries

### 2. Math Agent
- Handles all math and calculation queries
- Uses the `calculator` tool to evaluate expressions
- Never guesses — always calls the tool explicitly

### 3. Programming Agent
- Handles coding questions and text analysis
- Uses the `wordCounter` tool for word count queries
- Can answer general programming questions directly

---

## Tools Explanation

### `calculator`
- Takes a math expression as string e.g. `"5 * 10 + 3"`
- Evaluates it and returns the result
- Called explicitly by Math Agent — no hallucinated answers

### `wordCounter`
- Takes any text string as input
- Counts total words using whitespace splitting
- Returns the word count as a string
- Called explicitly by Programming Agent

---

## Handoff Flow

```
User Input
    ↓
Router Agent (triage + guardrail check)
    ↓                    ↓
Math Agent        Programming Agent
    ↓                    ↓
calculator tool    wordCounter tool
    ↓                    ↓
         Final Output
```

**Hard Rules followed:**
- Router agent never answers domain questions directly
- At least one handoff happens on every domain query
- Tools are called explicitly with real inputs — no fake results

---

## Part 1 – Agentic AI Theory Notes

### 1. What is Agentic AI?

**Single-prompt LLM usage:**
You send one message → LLM replies → done. No memory, no tools, no decisions.

**Agentic AI:**
The AI has a goal, takes multiple steps, uses tools, remembers context, and can delegate tasks to other agents. It "acts" rather than just "responds".

**Why agents are stateful, goal-driven, and tool-using:**
- **Stateful** – remembers previous messages and tool results within a run
- **Goal-driven** – works toward completing a task, not just answering one question
- **Tool-using** – calls real functions (calculator, API, database) instead of guessing

**Real-world examples:**
- POS assistant – takes order, checks inventory, calculates bill
- Support bot – reads ticket, checks order status via API, responds to customer
- Planner agent – breaks a big task into subtasks and assigns to sub-agents
- Code reviewer – reads code, runs linter tool, returns structured feedback

---

### 2. Core Concepts in OpenAI Agents SDK

#### Agent
An Agent is an AI entity with a name, instructions (system prompt), a model, and optional tools or handoffs.
- **Instructions** – define the agent's role and behavior (like a system prompt)
- **Role and responsibility** – each agent should have one clear job

#### Tool
A Tool is a real function the agent can call to get data or perform actions.
- Agents should NOT hallucinate actions — if a calculator tool exists, the agent must call it, not guess the answer
- Tools have defined input schemas (using Zod) so the agent knows exactly what to pass

#### Handoff
Handoff allows one agent to transfer control to another agent.
- Multiple agents are needed because each agent should have one focused responsibility
- Example: Router Agent detects a math question → hands off to Math Agent

#### Guardrail
Guardrail is validation logic that blocks or modifies unsafe input/output.
- Input guardrail: checks user message before processing (e.g., block harmful queries)
- Output guardrail: checks agent response before sending to user
- In this project, the Router Agent's instructions contain guardrail logic

#### Runner
Runner is the execution engine that runs agents.
- It manages the agent loop: call model → execute tools → handle handoffs → return final output
- Supports both sync (`Runner.run`) and async execution
- In this project: `runner.run(routerAgent, input)` starts the whole flow

#### Tracing
Tracing records every step of agent execution — LLM calls, tool calls, handoffs, and outputs.
- Helps debug why an agent made a certain decision
- Helps see which tool was called with what inputs
- In this project, tracing is **intentionally disabled** using `setTracingDisabled(true)` because we are using Gemini API key, not OpenAI — the SDK would otherwise try to POST traces to api.openai.com and fail

---

### 3. LLM Configuration Levels

#### Agent-level Configuration ✅ (Preferred)
Model is set directly on the Agent definition.
```ts
const mathAgent = new Agent({
  name: 'Math Agent',
  model: 'gemini-2.5-flash',  // agent-level
  instructions: '...',
});
```
**Why preferred:** Each agent can use a different model suited to its task. Math agent can use a fast model, while a reasoning agent can use a more powerful one.

**Use case:** Math Agent uses `gemini-2.5-flash` (fast + cheap), while a Research Agent might use `gemini-2.5-pro` (more capable).

#### Run-level Configuration
Model or settings are passed at the time of running, overriding agent defaults.
```ts
runner.run(agent, input, { model: 'gemini-2.5-pro' });
```
**Use case:** During testing, temporarily switch all agents to a cheaper model without editing each agent file.

#### Global-level Configuration
Model provider is set globally when creating the Runner instance.
```ts
const runner = new Runner({
  modelProvider: new GeminiProvider()  // global-level
});
```
**Use case:** Swap the entire backend from OpenAI to Gemini for all agents at once — done in this project via `GeminiProvider`.

---

### 4. Prompt-based LLM Usage vs Agent-based Systems

| Feature | Prompt-based LLM | Agent-based System |
|---|---|---|
| Memory | None (stateless) | Stateful across steps |
| Actions | Cannot take actions | Uses real tools |
| Decision making | Single response | Multi-step reasoning |
| Task delegation | Not possible | Handoffs to specialists |
| Real-world integration | No | Yes (APIs, DBs, tools) |
| Error recovery | No retry logic | Can retry or reroute |
| Example | ChatGPT one-off question | Support bot, planner, POS |

---

## Part 4 – Tracing & Observability

### What tracing shows:
- Which agent was activated
- What input was sent to the model
- Which tool was called and with what arguments
- Which agent was handed off to
- Final output of each step

### How it helps debug agent decisions:
If an agent gives wrong output, tracing shows exactly where it went wrong — was it the routing decision, the tool call, or the final response generation.

### What was observed during execution:
```
[Agent Call] Activating: the primary triage assistant...
[Handoff] Requesting transfer to: Math Agent
[Agent Call] Activating: an expert mathematician...
[Tool Call] Requesting tool: calculator with args: {"expression":"2*5"}
[Tool: calculator] Evaluating: 2*5
[Tool: calculator] Output: Result of 2*5 is 10
```

This confirms:
1. Router Agent correctly identified a math query
2. Handoff to Math Agent happened successfully
3. Math Agent called the calculator tool (no hallucination)
4. Tool returned real computed result

Tracing is **disabled** in this project (`setTracingDisabled(true)`) because the SDK's built-in tracing tries to send data to OpenAI's servers, but we are using Gemini API — this would cause authentication errors. The console.log statements in the code serve as manual tracing.

---

## Project Structure

```
day-31-ai-agents-intro/
├── cli.ts              # Entry point — terminal loop + Runner
├── agents.ts           # All 3 agents defined (Router, Math, Programming)
├── tools.ts            # Calculator and WordCounter tools
├── geminiProvider.ts   # Custom Gemini API adapter for OpenAI Agents SDK
├── .env                # API key (not committed to git)
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| TypeScript | Language |
| `@openai/agents` | Multi-agent framework |
| `@openai/agents-core` | Core SDK types and interfaces |
| `zod` | Tool parameter validation |
| `tsx` | Run TypeScript directly |
| `dotenv` | Load API key from .env |
| `readline` | Terminal input interface |
| Gemini API | LLM backend (via custom provider) |

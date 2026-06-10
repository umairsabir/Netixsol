# Multi-Agent Research and Report System

A robust multi-agent AI system built using the OpenAI Agents SDK and Google Gemini API to research real-world topics, reason over findings, and produce structured reports.

## 🧩 Architecture

The system uses three specialized agents:

1.  **Manager Agent (Orchestrator)**: Understands user queries, breaks them into subtasks, and delegates work. It never calls tools directly.
2.  **Research Agent**: Performs factual research using the **Tavily Search API**. Returns structured findings and source URLs.
3.  **Writer Agent**: Normalizes research data, reasons over it, and produces a final structured report with clear headings, analysis, and sources.

## 🛠 Tech Stack

- **Framework**: OpenAI Agents SDK (`@openai/agents`)
- **LLM**: Google Gemini 2.0 Flash (via custom `GeminiProvider`)
- **Search Tool**: Tavily Search API
- **Language**: TypeScript / Node.js

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- Pnpm (or npm/yarn)
- [Tavily API Key](https://tavily.com/)
- [Gemini API Key](https://aistudio.google.com/)

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd day-32-multi-agent-research-and-report-system
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory and add your keys:
    ```env
    GEMINI_API_KEY="your-gemini-api-key"
    TAVILY_API_KEY="your-tavily-api-key"
    ```

### How to Run

Start the CLI assistant:
```bash
pnpm start
```

## 📝 Example Queries

- "Compare Stripe vs Razorpay for a SaaS in Pakistan"
- "Impact of AI on software engineering jobs in 2024"
- "Best renewable energy sources for residential use in California"

## 📄 Agent Responsibilities

| Agent | Responsibility | Tools |
| :--- | :--- | :--- |
| **Manager** | Orchestration & Delegation | Handoffs only |
| **Research** | Factual Search | Tavily Search |
| **Writer** | Report Generation | None |

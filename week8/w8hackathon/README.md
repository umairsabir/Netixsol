# Smart Document Intelligence System

A multi-agent AI platform built with the **OpenAI Agents SDK** and **Groq (Llama-3.3-70b)** for deep PDF analysis and interactive Q&A.

## 🚀 Features

- **Multi-Agent Orchestration**: Specialized agents for Routing, Analysis, Summarization, and Q&A.
- **Agentic Handoffs**: Intelligent routing between agents based on user intent.
- **Real-Time Analysis**: Automatic document type identification and executive summary generation upon upload.
- **Grounded Q&A**: Answers are strictly based on document content using retrieval tools.
- **Programmatic Guardrails**: Pattern-based blocking of unsafe/unrelated queries before AI invocation.

## 🏗️ Architecture

The system follows a star-topology multi-agent architecture:

1. **Router Agent**: Analyzes intent and delegates to specialized agents. Never answers directly.
2. **Analysis Agent**: Identifies document structure and metadata using `pdfExtraction` + `sectionLocator` tools.
3. **Summary Agent**: Distills content into summaries and highlights using `chunkRetriever` tool.
4. **Q&A Agent**: Performs grounded fact-finding using `chunkRetriever` + `sectionLocator` tools.

### Tools Used
- `pdfExtraction`: Extracts raw text from PDF files.
- `chunkRetriever`: Performs keyword-based semantic search across document chunks.
- `sectionLocator`: Identifies and extracts specific sections by heading name.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Material UI v9, RTK Query, Tailwind CSS.
- **Backend**: NestJS, MongoDB (Mongoose).
- **AI**: OpenAI Agents SDK, Groq API (Llama-3.3-70b-versatile).

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB instance (local or Atlas)
- Groq API Key (free at https://console.groq.com)

### Backend Setup
1. `cd backend`
2. Create `.env` from `.env.example`:
   ```env
   MONGODB_URI=your_mongodb_uri
   GROQ_API_KEY=your_groq_api_key
   PORT=3002
   ```
3. `pnpm install`
4. `pnpm start:dev`

### Frontend Setup
1. `cd frontend`
2. Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3002
   ```
3. `pnpm install`
4. `pnpm dev`

## 🔐 Guardrails
- **Programmatic Checks**: Regex-based pattern matching blocks prompt injection, harmful content, and off-topic queries BEFORE AI invocation.
- **Grounded Instructions**: Agents are strictly instructed to refuse external knowledge.
- **Router Enforcement**: Router Agent never answers — only routes via handoffs.

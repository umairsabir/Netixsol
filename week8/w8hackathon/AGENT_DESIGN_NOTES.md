# Agent Design Notes

## Architecture Overview

The system is designed around a **Star Topology** with a central **Router Agent** managing three specialized agents.

### 1. Router Agent (The Triage)
- **Role**: Analyzes the raw user query and determines the required capability.
- **Rationale**: By isolating routing, we ensure that specialized agents only receive requests they are optimized for. This reduces token noise and increases accuracy.
- **Guardrail**: Acts as the first line of defense against prompt injection and unrelated queries.

### 2. Document Analysis Agent (The Architect)
- **Role**: Understands the structural integrity of the PDF.
- **Tools**: `pdfExtraction`, `sectionLocator`.
- **Specialization**: Optimized for parsing long-form text to identify metadata and document schema.

### 3. Summary Agent (The Distiller)
- **Role**: Compresses large volumes of information into structured insights.
- **Specialization**: Uses specific output templates (`TYPE`, `EXECUTIVE SUMMARY`, etc.) that the backend can reliably parse.

### 4. Q&A Agent (The Researcher)
- **Role**: Precise fact-finding.
- **Tools**: `chunkRetriever` (for semantic-like keyword search), `sectionLocator`.
- **Constraint**: Strictly grounded in the document. It is instructed to refuse if the answer is not present.

## Why 4 Agents instead of 1?

1. **Focus**: A single agent trying to summarize, analyze, and answer questions simultaneously often suffers from "instruction following degradation."
2. **Tool Efficiency**: Q&A needs search tools, while Summary needs full text. If one agent had both, it might use the wrong tool for the task (e.g., trying to summarize from a small chunk).
3. **Guardrails**: It is easier to enforce "no external knowledge" on a Q&A agent than on a Summary agent that might need to use its knowledge of document types.

## Future Improvements

- **Vector Database**: Replace the `chunkRetriever`'s regex-based search with a real vector store (e.g., Pinecone or ChromaDB) for true semantic RAG.
- **Streaming**: Implement SSE (Server-Sent Events) to stream agent thoughts to the UI in real-time.
- **Multi-Document Support**: Allow agents to reason across multiple uploaded files.

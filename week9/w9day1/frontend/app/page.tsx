"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface TraceStep {
  step: string;
  timestamp: string;
  input?: any;
  output?: any;
  duration?: number;
}

interface StepCardProps {
  step: TraceStep;
  index: number;
  formatDuration: (ms?: number) => string;
}

function StepCard({ step, index, formatDuration }: StepCardProps) {
  const [expanded, setExpanded] = useState(false);

  const stepConfig: Record<
    string,
    { icon: string; color: string; bg: string; desc: string }
  > = {
    QuestionSplitter: {
      icon: "✂️",
      color: "text-violet-600",
      bg: "bg-violet-100 dark:bg-violet-900/30",
      desc: "Breaking down the question into sub-questions",
    },
    DocumentFinder: {
      icon: "🔍",
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      desc: "Searching for relevant documents",
    },
    Ranker: {
      icon: "📊",
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      desc: "Ranking documents by relevance (TF-IDF)",
    },
    Summarizer: {
      icon: "📝",
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      desc: "Generating extractive summaries",
    },
    CrossChecker: {
      icon: "⚖️",
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-900/30",
      desc: "Checking for contradictions between sources",
    },
    FinalAnswerMaker: {
      icon: "🎯",
      color: "text-cyan-600",
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
      desc: "Synthesizing final answer",
    },
  };

  const config = stepConfig[step.step] || {
    icon: "⚙️",
    color: "text-slate-600",
    bg: "bg-slate-100",
    desc: "Processing",
  };

  const renderOutput = () => {
    if (!step.output) return null;

    if (
      step.step === "QuestionSplitter" &&
      Array.isArray(step.output.subQuestions)
    ) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Sub-questions generated:
          </p>
          <div className="flex flex-wrap gap-2">
            {step.output.subQuestions.map((sq: any, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-lg text-sm"
              >
                {sq.text}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (
      step.step === "DocumentFinder" &&
      Array.isArray(step.output.documents)
    ) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Found {step.output.documents.length} documents:
          </p>
          <div className="flex flex-wrap gap-2">
            {step.output.documents
              .slice(0, expanded ? undefined : 5)
              .map((doc: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                >
                  {doc.title}
                </span>
              ))}
            {!expanded && step.output.documents.length > 5 && (
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg text-sm">
                +{step.output.documents.length - 5} more
              </span>
            )}
          </div>
          {step.output.documents.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              {expanded
                ? "Show less"
                : `Show all ${step.output.documents.length}`}
            </button>
          )}
        </div>
      );
    }

    if (step.step === "Ranker" && Array.isArray(step.output.rankedDocuments)) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Top ranked documents:
          </p>
          <div className="space-y-2">
            {step.output.rankedDocuments
              .slice(0, 5)
              .map((doc: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                >
                  <span className="w-6 h-6 bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                    {doc.title}
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {(doc.score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      );
    }

    if (step.step === "Summarizer" && Array.isArray(step.output.summaries)) {
      return (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Generated summaries:
          </p>
          {step.output.summaries
            .slice(0, expanded ? undefined : 3)
            .map((sum: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400"
              >
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                  {sum.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 wrap-break-word">
                  {sum.summary}
                </p>
              </div>
            ))}
          {step.output.summaries.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-amber-600 hover:underline"
            >
              {expanded
                ? "Show less"
                : `Show all ${step.output.summaries.length} summaries`}
            </button>
          )}
        </div>
      );
    }

    if (step.step === "CrossChecker") {
      const contradictions = step.output.contradictions || [];
      if (contradictions.length === 0) {
        return (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <span className="text-emerald-600">✓</span>
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              No contradictions found between sources
            </span>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
            ⚠️ {contradictions.length} contradiction(s) detected:
          </p>
          {contradictions.map((c: any, i: number) => (
            <div
              key={i}
              className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg border-l-4 border-rose-400"
            >
              <p className="text-xs text-rose-600 mb-1">
                Between: {c.between.join(" & ")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      );
    }

    if (step.step === "FinalAnswerMaker") {
      return (
        <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
          <p className="text-xs font-medium text-cyan-600 mb-2">
            Final Answer Generated
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Answer length: {step.output.finalAnswer?.length || 0} characters
          </p>
        </div>
      );
    }

    return (
      <span className="text-sm text-slate-500 wrap-break-word">
        {typeof step.output === "string"
          ? step.output
          : "Step completed successfully"}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center shrink-0`}
        >
          <span className="text-2xl">{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className={`font-semibold ${config.color}`}>{step.step}</h4>
            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">
              {formatDuration(step.duration)}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {config.desc}
          </p>
          <div className="mt-4">{renderOutput()}</div>
        </div>
      </div>
    </div>
  );
}

interface ResearchResponse {
  queryId: string;
  answer: string;
  trace: {
    queryId: string;
    originalQuestion: string;
    steps: TraceStep[];
    subQuestions: Array<{ id: string; text: string }>;
    rankedDocuments: Array<{
      id: string;
      title: string;
      topic: string;
      score: number;
    }>;
    summaries: Array<{ documentId: string; title: string; summary: string }>;
    contradictions: Array<{ between: string[]; description: string }>;
    finalAnswer: string;
    status: string;
    createdAt: string;
  };
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"answer" | "trace">("answer");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002"}/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Compare SQL vs NoSQL databases",
    "Should I use REST API or GraphQL?",
    "Monolithic vs Microservices architecture",
    "When should I use SSR vs CSR?",
    "WebSockets vs HTTP Polling for real-time apps",
  ];

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Multi-Agent Research System
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Ask a question and watch our LangGraph-powered agents break it down,
            find relevant documents, and synthesize an answer.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about software architecture, databases, APIs, or web technologies..."
              className="w-full h-32 p-4 pr-24 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute bottom-4 right-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Researching...
                </>
              ) : (
                "Ask"
              )}
            </button>
          </form>

          {/* Sample Questions */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("answer")}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === "answer"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Final Answer
              </button>
              <button
                onClick={() => setActiveTab("trace")}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === "trace"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Execution Trace ({result.trace.steps.length} steps)
              </button>
            </div>

            {/* Answer Tab */}
            {activeTab === "answer" && (
              <div className="space-y-6">
                {/* Main Answer */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Answer
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    <ReactMarkdown>{result.answer}</ReactMarkdown>
                  </div>
                </div>

                {/* Contradictions Warning */}
                {result.trace.contradictions.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <svg
                        className="w-5 h-5 text-amber-600 dark:text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-400">
                        Contradictions Detected
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {result.trace.contradictions.map((c, i) => (
                        <li
                          key={i}
                          className="text-amber-700 dark:text-amber-300 text-sm"
                        >
                          Between "{c.between.join('" and "')}": {c.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documents Used */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Sources Consulted
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.trace.rankedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <div className="font-medium text-slate-900 dark:text-white wrap-break-word">
                          {doc.title}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 wrap-break-word">
                          {doc.topic}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Score: {doc.score.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Trace Tab */}
            {activeTab === "trace" && (
              <div className="space-y-4">
                {/* Sub-questions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Question Breakdown
                  </h3>
                  <div className="space-y-2">
                    {result.trace.subQuestions.map((sq) => (
                      <div
                        key={sq.id}
                        className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                      >
                        <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                          {sq.id}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 wrap-break-word overflow-wrap-anywhere">
                          {sq.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution Steps */}
                <div className="space-y-4">
                  {result.trace.steps.map((step, i) => (
                    <StepCard
                      key={i}
                      step={step}
                      index={i}
                      formatDuration={formatDuration}
                    />
                  ))}
                </div>

                {/* Query Info */}
                <div className="text-center text-sm text-slate-500 dark:text-slate-400 break-all">
                  Query ID: {result.queryId} • Created:{" "}
                  {new Date(result.trace.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

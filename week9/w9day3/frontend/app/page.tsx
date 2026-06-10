"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isRelevant?: boolean;
  trace?: any;
  timestamp: Date;
}

interface HistoryTurn {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  let id = localStorage.getItem("cricket_user_id");
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("cricket_user_id", id);
  }
  return id;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

// ─── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTrace, setShowTrace] = useState<string | null>(null);
  const [showMemory, setShowMemory] = useState(true);
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [userId, setUserId] = useState<string>("anonymous");
  const [userIdInput, setUserIdInput] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setUserIdInput(id);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── Fetch memory panel ────────────────────────────────────────────────────

  const fetchMemory = useCallback(async () => {
    if (!userId || userId === "anonymous") return;
    setMemoryLoading(true);
    try {
      const [histRes, sumRes] = await Promise.all([
        fetch(`${BACKEND}/cricket/history/${userId}`),
        fetch(`${BACKEND}/cricket/summary/${userId}`),
      ]);
      if (histRes.ok) {
        const hData = await histRes.json();
        setHistory(hData.history || []);
      }
      if (sumRes.ok) {
        const sData = await sumRes.json();
        setSummary(sData.summary || null);
      }
    } catch {
      // silently ignore
    } finally {
      setMemoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (showMemory) fetchMemory();
  }, [showMemory, fetchMemory]);

  // ─── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND}/cricket/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, userId }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: data.queryId,
          role: "assistant",
          content: data.answer,
          isRelevant: data.isRelevant,
          trace: data.trace,
          timestamp: new Date(),
        },
      ]);

      // Refresh memory panel silently after each answer
      if (showMemory) fetchMemory();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Who has the most runs in Test cricket?",
    "Top 5 wicket takers in ODI",
    "Highest batting average in T20",
    "Most matches played in Test cricket",
  ];

  // ─── Step Card ─────────────────────────────────────────────────────────────

  const StepCard = ({ step }: { step: any }) => {
    const stepConfig: Record<string, { icon: string; color: string; bg: string }> = {
      RelevancyChecker: { icon: "✅", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
      MemoryRetriever:  { icon: "🧠", color: "text-purple-600",  bg: "bg-purple-100 dark:bg-purple-900/30"  },
      QueryGenerator:   { icon: "⚡", color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/30"  },
      QueryExecutor:    { icon: "🗄️", color: "text-blue-600",    bg: "bg-blue-100 dark:bg-blue-900/30"      },
      AnswerFormatter:  { icon: "📄", color: "text-amber-600",   bg: "bg-amber-100 dark:bg-amber-900/30"    },
      MemorySaver:      { icon: "💾", color: "text-teal-600",    bg: "bg-teal-100 dark:bg-teal-900/30"      },
    };

    const config = stepConfig[step.step] || { icon: "⚙️", color: "text-slate-600", bg: "bg-slate-100" };

    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center shrink-0`}>
            <span className="text-xl">{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${config.color}`}>{step.step}</span>
              <span className="text-xs text-slate-400">{step.duration}ms</span>
            </div>
            {step.output && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {typeof step.output === "object" ? (
                  <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                ) : (
                  String(step.output).substring(0, 200)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Memory Panel ──────────────────────────────────────────────────────────

  const MemoryPanel = () => (
    <div
      className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 flex flex-col"
      style={{ animation: "slideInRight 0.25s ease" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">Memory</span>
        </div>
        <button
          onClick={() => setShowMemory(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {memoryLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Conversation Summary
              </h3>
              {summary ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {summary}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No summary yet — available after 10+ messages.
                </p>
              )}
            </section>

            {/* History */}
            <section>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Conversation History ({history.length})
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No history yet.</p>
              ) : (
                <div className="space-y-4">
                  {history.slice(-10).reverse().map((turn) => (
                    <div
                      key={turn._id}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                    >
                      {/* Question */}
                      <div className="flex items-start gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2">
                        <span className="text-emerald-500 font-bold text-xs mt-0.5 shrink-0">Q</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{turn.question}</p>
                      </div>
                      {/* Answer rendered as Markdown */}
                      <div className="px-3 py-2 overflow-x-auto">
                        <div className="prose prose-xs dark:prose-invert max-w-none text-slate-600 dark:text-slate-400
                          prose-p:my-1 prose-p:text-xs
                          prose-table:text-xs prose-table:w-full
                          prose-th:px-2 prose-th:py-1 prose-th:text-left prose-th:bg-slate-50 dark:prose-th:bg-slate-800
                          prose-td:px-2 prose-td:py-1 prose-td:border-t prose-td:border-slate-200 dark:prose-td:border-slate-700
                          prose-headings:text-xs prose-headings:font-semibold prose-headings:my-1
                          prose-li:text-xs prose-li:my-0
                          prose-strong:text-slate-700 dark:prose-strong:text-slate-300">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {turn.answer.length > 600 ? turn.answer.substring(0, 600) + "\n\n*...see full answer in chat*" : turn.answer}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {/* Timestamp */}
                      <div className="px-3 py-1 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        🕐 {new Date(turn.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2">
        {editingUserId ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = userIdInput.trim();
              if (!trimmed) return;
              localStorage.setItem("cricket_user_id", trimmed);
              setUserId(trimmed);
              setEditingUserId(false);
              fetchMemory();
            }}
            className="flex gap-1"
          >
            <input
              autoFocus
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="flex-1 text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              placeholder="Enter your user ID"
            />
            <button type="submit" className="text-xs text-emerald-600 font-medium px-2">Save</button>
            <button type="button" onClick={() => setEditingUserId(false)} className="text-xs text-slate-400 px-1">✕</button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 truncate">
              Session: <span className="font-mono">{userId.slice(0, 20)}{userId.length > 20 ? '…' : ''}</span>
            </p>
            <button
              onClick={() => setEditingUserId(true)}
              className="text-xs text-slate-400 hover:text-slate-600 ml-1 shrink-0"
            >
              ✏️
            </button>
          </div>
        )}
        <button
          onClick={fetchMemory}
          className="text-xs text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950 dark:to-slate-900">
      {showMemory && <MemoryPanel />}

      <div
        className={`mx-auto px-4 py-8 h-screen flex flex-col transition-all duration-200 ${showMemory ? "max-w-3xl mr-80" : "max-w-4xl"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              🏏 Cricket Stats AI
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Ask me anything about Test, ODI, or T20 cricket statistics
            </p>
          </div>
          <button
            onClick={() => setShowMemory((v) => !v)}
            title="Toggle memory panel"
            className={`ml-4 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm border ${
              showMemory
                ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:text-purple-600"
            }`}
          >
            <span>🧠</span>
            <span>Memory</span>
            {history.length > 0 && (
              <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : msg.isRelevant === false
                    ? "bg-amber-50 dark:bg-amber-900/30 border border-amber-200 text-amber-800 dark:text-amber-400"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {msg.role === "assistant" ? (
                  <>
                    <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead className="bg-slate-50 dark:bg-slate-800/80" {...props} />,
                          th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider" {...props} />,
                          td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-t border-slate-200 dark:border-slate-700" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {msg.trace?.steps?.length > 0 && msg.isRelevant && (
                      <button
                        onClick={() =>
                          setShowTrace(showTrace === msg.id ? null : msg.id)
                        }
                        className="mt-3 text-xs text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        {showTrace === msg.id ? "Hide" : "Show"} execution trace
                        <span className="text-slate-400">
                          ({msg.trace.steps?.length || 0} steps)
                        </span>
                      </button>
                    )}
                    {showTrace === msg.id && msg.trace?.steps && (
                      <div className="mt-4 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <p className="text-xs font-medium text-slate-500">Execution Trace:</p>
                        {msg.trace.steps.map((step: any, i: number) => (
                          <StepCard key={i} step={step} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-white">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-2 text-sm text-slate-500">Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        <div className="mb-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <div className="flex gap-2">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInput(q);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="shrink-0 px-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cricket stats… or follow up on a previous question!"
            className="w-full px-5 py-4 pr-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

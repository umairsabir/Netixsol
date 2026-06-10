"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: question, timestamp: new Date() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND}/cricket/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `res-${Date.now()}`,
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        },
      ]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 dark:from-emerald-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 h-screen flex flex-col">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            🏏 Cricket Stats AI
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Ask me anything about Test, ODI, or T20 cricket statistics
          </p>
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
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ ...props }) => (
                          <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
                          </div>
                        ),
                        thead: ({ ...props }) => <thead className="bg-slate-50 dark:bg-slate-800/80" {...props} />,
                        th: ({ ...props }) => <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider" {...props} />,
                        td: ({ ...props }) => <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap border-t border-slate-200 dark:border-slate-700" {...props} />,
                        p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
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
        <div className="mb-3 overflow-x-auto pb-2">
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
            placeholder="Ask about cricket stats…"
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
    </div>
  );
}

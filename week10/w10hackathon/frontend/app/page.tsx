"use client";

import React, { useState } from "react";

function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentVal = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          currentVal += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentVal);
        currentVal = '';
      } else if (char === '\n') {
        row.push(currentVal);
        result.push(row);
        row = [];
        currentVal = '';
      } else if (char === '\r') {
        // skip
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal);
    result.push(row);
  }

  return result;
}

export default function TeacherDashboard() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("loose");
  const [files, setFiles] = useState<File[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [csvResult, setCsvResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || files.length === 0) {
      alert("Please provide instructions and upload at least one PDF.");
      return;
    }

    setIsEvaluating(true);
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("mode", mode);
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:3002/evaluate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Evaluation failed");
      }

      const csvText = await response.text();
      setCsvResult(csvText);

    } catch (error) {
      console.error(error);
      alert("Failed to evaluate assignments. Check console for details.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleDownload = () => {
    if (!csvResult) return;
    const blob = new Blob([csvResult], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marks_sheet.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const resetForm = () => {
    setCsvResult(null);
    setFiles([]);
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-800 p-8 shadow-2xl">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-2">
          AI Assignment Checker
        </h1>
        <p className="text-gray-400 mb-8">
          Upload student submissions and let AI evaluate them based on your instructions.
        </p>

        {!csvResult ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Assignment Instructions
              </label>
              <textarea
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-y min-h-[120px]"
                placeholder="e.g., Write an essay on mental health, 500 words..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Evaluation Mode
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${mode === 'strict'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}>
                  <input
                    type="radio"
                    name="mode"
                    value="strict"
                    checked={mode === "strict"}
                    onChange={() => setMode("strict")}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mode === 'strict' ? 'border-indigo-500' : 'border-gray-600'}`}>
                    {mode === 'strict' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  Strict Marking
                </label>

                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${mode === 'loose'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}>
                  <input
                    type="radio"
                    name="mode"
                    value="loose"
                    checked={mode === "loose"}
                    onChange={() => setMode("loose")}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mode === 'loose' ? 'border-indigo-500' : 'border-gray-600'}`}>
                    {mode === 'loose' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  Loose Marking
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Student Submissions (PDFs)
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-800 rounded-xl bg-gray-950 hover:bg-gray-900/80 hover:border-gray-700 transition-all cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 mb-4 rounded-full bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-medium">Click to upload PDFs</span>
                  <span className="text-gray-500 text-sm mt-1">{files.length} file(s) selected</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isEvaluating}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isEvaluating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Evaluate Assignments"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-200 mb-4">Evaluation Results</h2>
            <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-900 border-b border-gray-800">
                    <tr>
                      {(() => {
                        const parsed = parseCSV(csvResult);
                        const headers = parsed[0] || [];
                        return headers.map((header, i) => (
                          <th key={i} className="px-6 py-3">{header}</th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const parsed = parseCSV(csvResult);
                      const rows = parsed.slice(1).filter(r => r.some(c => c.trim() !== ''));
                      return rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                          {row.map((col, j) => (
                            <td key={j} className="px-6 py-4 max-w-xs" title={col}>
                              <div className="max-h-32 overflow-y-auto whitespace-pre-wrap pr-2 custom-scrollbar">
                                {col}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleDownload}
                className="flex-1 py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
              <button
                onClick={resetForm}
                className="flex-1 py-4 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-all flex items-center justify-center gap-2"
              >
                Evaluate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  tags: string[];
  stock: number;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Vitamins": "badge-green",
  "Supplements": "badge-blue",
  "Bone Health": "badge-amber",
  "Hair & Nail": "badge-purple",
  "Immunity": "badge-green",
  "Digestive Health": "badge-blue",
  "Skin Care": "badge-purple",
  "Pain Relief": "badge-red",
  "Heart Health": "badge-red",
  "Eye Care": "badge-blue",
  "Sleep & Stress": "badge-purple",
  "Weight Management": "badge-green",
  "Diabetes Care": "badge-amber",
  "Protein & Fitness": "badge-blue",
};

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("hc_token") : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const colorClass = CATEGORY_COLORS[product.category] || "badge-blue";
  return (
    <div className="glass-card animate-fade-up" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.3", flex: 1 }}>{product.name}</h3>
        <span className={`badge ${colorClass}`} style={{ flexShrink: 0 }}>{product.category}</span>
      </div>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6", flex: 1 }}>
        {product.description.substring(0, 120)}{product.description.length > 120 ? "…" : ""}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {product.tags.slice(0, 4).map((tag) => (
          <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
            {tag}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--accent)" }}>₹{product.price}</span>
        <span style={{ fontSize: "12px", color: product.stock > 0 ? "var(--accent)" : "var(--danger)" }}>
          {product.stock > 0 ? `✓ In Stock (${product.stock})` : "Out of Stock"}
        </span>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="skeleton" style={{ height: "20px", width: "70%" }} />
      <div className="skeleton" style={{ height: "14px", width: "40%" }} />
      <div className="skeleton" style={{ height: "56px" }} />
      <div style={{ display: "flex", gap: "6px" }}>
        <div className="skeleton" style={{ height: "22px", width: "60px", borderRadius: "12px" }} />
        <div className="skeleton" style={{ height: "22px", width: "50px", borderRadius: "12px" }} />
      </div>
      <div className="skeleton" style={{ height: "24px", width: "30%", marginTop: "8px" }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<"title" | "ai">("title");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ explanation: string; intent: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isCancellingRef = useRef(false);

  // Auth guard & Cleanup
  useEffect(() => {
    const token = localStorage.getItem("hc_token");
    const userData = localStorage.getItem("hc_user");
    if (!token) { router.replace("/"); return; }
    if (userData) setUser(JSON.parse(userData));

    return () => {
      window.speechSynthesis?.cancel();
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch {}
        audioSourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [router]);

  const fetchProducts = useCallback(async (cat?: string) => {
    setLoading(true);
    try {
      const url = cat && cat !== "All" ? `${BACKEND}/products?category=${encodeURIComponent(cat)}` : `${BACKEND}/products`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.status === 401) { router.replace("/"); return; }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, [router]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND}/products/categories`, { headers: authHeaders() });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { /**/ }
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) { setAiResult(null); fetchProducts(activeCategory !== "All" ? activeCategory : undefined); return; }
    setSearchLoading(true);
    setAiResult(null);
    try {
      if (searchMode === "title") {
        const res = await fetch(`${BACKEND}/products/search?q=${encodeURIComponent(searchQuery)}`, { headers: authHeaders() });
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        const res = await fetch(`${BACKEND}/products/ai-search?q=${encodeURIComponent(searchQuery)}`, { headers: authHeaders() });
        const data = await res.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
        setAiResult({ explanation: data.explanation, intent: data.intent });
      }
    } catch { /**/ } finally { setSearchLoading(false); }
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery("");
    setAiResult(null);
    fetchProducts(cat !== "All" ? cat : undefined);
  };

  // ── Text-to-Speech (Groq Backend) ────────────────────────────────────────────
  const speakText = async (text: string) => {
    if (!ttsEnabled || typeof window === "undefined") return;

    // Stop current audio if playing
    stopSpeaking();

    // Clean text for speech
    const clean = text.replace(/[#*`_~>\[\]]/g, "").replace(/\n+/g, " ").trim();

    try {
      setIsSpeaking(true);

      const res = await fetch(`${BACKEND}/products/text-to-speech`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ text: clean }),
      });

      if (!res.ok) {
        // Check if it's TTS_UNAVAILABLE — fall back to browser voice
        const err = await res.json().catch(() => ({}));
        if (err?.message?.code === "TTS_UNAVAILABLE" || res.status === 400) {
          throw new Error("FALLBACK");
        }
        throw new Error("TTS request failed");
      }

      // Use Web Audio API to prevent OS media player notifications
      const arrayBuffer = await res.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      audioSourceRef.current = source;

      source.onended = () => {
        setIsSpeaking(false);
        audioSourceRef.current = null;
      };

      // Aggressively prevent Chrome media session
      if ('mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = 'none'; } catch {}
      }

      source.start(0);

    } catch {
      // Fallback: use browser's built-in speechSynthesis
      console.warn("Groq TTS unavailable, falling back to browser voice.");
      if (!window.speechSynthesis) { setIsSpeaking(false); return; }
      
      // Aggressively prevent Chrome media session for speech synthesis too
      if ('mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = 'none'; } catch {}
      }
      
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) =>
        v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural")
      );
      if (preferred) utter.voice = preferred;
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch {}
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    stopSpeaking();
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: msg };
    setChatMessages((p) => [...p, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${BACKEND}/products/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const responseText = data.response || "Sorry, I couldn't process that.";
      const botMsg: ChatMsg = { id: `bot-${Date.now()}`, role: "assistant", content: responseText, products: data.products };
      setChatMessages((p) => [...p, botMsg]);
    } catch {
      setChatMessages((p) => [...p, { id: `err-${Date.now()}`, role: "assistant", content: "Error connecting to assistant. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  // Quick-reply: fill input AND auto-send
  const sendQuickReply = (text: string) => {
    stopSpeaking();
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: text };
    setChatMessages((p) => [...p, userMsg]);
    setChatLoading(true);
    fetch(`${BACKEND}/products/chat`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ message: text }) })
      .then((r) => r.json())
      .then((data) => {
        const responseText = data.response || "Sorry, I couldn't process that.";
        const botMsg: ChatMsg = { id: `bot-${Date.now()}`, role: "assistant", content: responseText, products: data.products };
        setChatMessages((p) => [...p, botMsg]);
      })
      .catch(() => setChatMessages((p) => [...p, { id: `err-${Date.now()}`, role: "assistant", content: "Error connecting to assistant." }]))
      .finally(() => setChatLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("hc_token");
    localStorage.removeItem("hc_user");
    router.replace("/");
  };

  // ── Voice Input ──────────────────────────────────────────────────────────────
  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      isCancellingRef.current = false;

      // Pick best supported MIME type
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        
        if (isCancellingRef.current) return;

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size < 100) return; // too small, likely empty

        setTranscribing(true);
        try {
          const token = localStorage.getItem("hc_token");
          const formData = new FormData();
          const ext = (recorder.mimeType || "audio/webm").includes("ogg") ? "ogg" : "webm";
          formData.append("audio", blob, `voice.${ext}`);

          const res = await fetch(`${BACKEND}/products/speech-to-text`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          if (!res.ok) throw new Error("Transcription request failed");
          const data = await res.json();
          if (data.text?.trim()) {
            const transcribed = data.text.trim();
            setChatInput(transcribed);
            // Auto-submit the transcribed text
            setTimeout(() => {
              const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
              const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: transcribed };
              setChatMessages((p) => [...p, userMsg]);
              setChatInput("");
              setChatLoading(true);
              fetch(`${BACKEND}/products/chat`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ message: transcribed }) })
                .then((r) => r.json())
                .then((data) => {
                  const responseText = data.response || "Sorry, I couldn't process that.";
                  const botMsg: ChatMsg = { id: `bot-${Date.now()}`, role: "assistant", content: responseText, products: data.products };
                  setChatMessages((p) => [...p, botMsg]);
                  setTimeout(() => speakText(responseText), 100);
                })
                .catch(() => setChatMessages((p) => [...p, { id: `err-${Date.now()}`, role: "assistant", content: "Error connecting to assistant." }]))
                .finally(() => setChatLoading(false));
            }, 50);
          }
        } catch (err) {
          console.error("Speech-to-text error:", err);
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for voice input.");
    }
  };

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancellingRef.current = false;
      mediaRecorderRef.current.stop();
    }
  };

  const cancelVoiceInput = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancellingRef.current = true;
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="bg-mesh" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1e]/85 backdrop-blur-xl border-b border-white/10 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-emerald-500/20">
              🏥
            </div>
            <div>
              <span className="gradient-text text-xl md:text-2xl font-extrabold tracking-tight">MediStore</span>
              <p className="hidden md:block text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Smart Healthcare</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <span className="text-xs text-slate-400">Welcome back,</span>
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </div>
            )}

            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

            <button
              id="chat-toggle-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all font-semibold text-sm group"
              onClick={() => setShowChat((v) => !v)}
            >
              <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
              <span>AI Assistant</span>
              {chatMessages.length > 0 && (
                <span className="bg-emerald-500 text-white rounded-full min-w-[20px] h-5 px-1.5 text-[10px] flex items-center justify-center font-bold">
                  {chatMessages.filter(m => m.role === "assistant").length}
                </span>
              )}
            </button>

            <button
              id="logout-btn"
              className="px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all font-semibold text-sm"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 text-slate-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-6 animate-fade-in">
            <div className="flex flex-col gap-4">
              {user && (
                <div className="px-2 mb-2">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Signed in as</p>
                  <p className="text-lg font-bold text-white">{user.name}</p>
                </div>
              )}

              <button
                className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold"
                onClick={() => { setShowChat(!showChat); setIsMenuOpen(false); }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <span>AI Health Assistant</span>
                </div>
                {chatMessages.length > 0 && (
                  <span className="bg-emerald-500 text-white rounded-full min-w-[24px] h-6 px-2 text-xs flex items-center justify-center font-bold">
                    {chatMessages.filter(m => m.role === "assistant").length}
                  </span>
                )}
              </button>

              <button
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold"
                onClick={handleLogout}
              >
                <span className="text-xl">🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Hero search */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
              Healthcare <span className="gradient-text">Products</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "24px" }}>
              Discover the right products for your health needs — with AI guidance.
            </p>

            {/* Search mode toggle */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {(["title", "ai"] as const).map((m) => (
                <button key={m} id={`search-mode-${m}`} onClick={() => { setSearchMode(m); setAiResult(null); }}
                  style={{
                    padding: "7px 16px", borderRadius: "20px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: "600", fontFamily: "inherit", transition: "all 0.2s",
                    background: searchMode === m ? "var(--accent-light)" : "transparent",
                    borderColor: searchMode === m ? "var(--accent)" : "var(--border)",
                    color: searchMode === m ? "var(--accent)" : "var(--text-muted)",
                  }}>
                  {m === "title" ? "🔍 Title Search" : "🤖 AI Intent Search"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input id="search-input" className="input-field pr-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchMode === "title" ? "Search by product name..." : "Describe your health need..."}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => { setSearchQuery(""); setAiResult(null); fetchProducts(activeCategory !== "All" ? activeCategory : undefined); }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto min-w-[120px] flex items-center justify-center gap-2" id="search-btn" disabled={searchLoading}>
                {searchLoading ? <div className="spinner" /> : (
                  <>
                    <span className="sm:hidden lg:inline text-lg">🔍</span>
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>

            {/* AI explanation banner */}
            {aiResult && (
              <div style={{ marginTop: "16px", background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.06))", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "14px", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span style={{ fontSize: "24px", flexShrink: 0 }}>🤖</span>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                      AI Detected: {aiResult.intent}
                    </p>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.6" }}>{aiResult.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category filter */}
          {!aiResult && (
            <div className="-mx-0 flex flex-nowrap overflow-x-auto lg:flex-wrap gap-2 mb-6 pb-2 lg:pb-0 hide-scrollbar scroll-smooth">
              {["All", ...categories].map((cat) => (
                <button key={cat} id={`cat-${cat}`} onClick={() => handleCategoryClick(cat)}
                  className={`
                    flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border whitespace-nowrap
                    ${activeCategory === cat
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/40 hover:text-emerald-400"}
                  `}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
            {loading || searchLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.length === 0
                ? (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "64px 20px" }}>
                    <p style={{ fontSize: "48px", marginBottom: "16px" }}>🔬</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>No products found</p>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Try a different search term or browse all categories.</p>
                  </div>
                )
                : products.map((p) => <ProductCard key={p._id} product={p} />)
            }
          </div>
        </div>

        {/* Chat Panel (slide-in / overlay on mobile) */}
        {showChat && (
          <aside className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-[380px] lg:flex-shrink-0 animate-slide-right">
            {/* Mobile Backdrop */}
            <div className="absolute inset-0 bg-[#0a0f1e]/60 backdrop-blur-sm lg:hidden" onClick={() => { setShowChat(false); stopSpeaking(); }}></div>

            <div className="absolute right-0 top-0 bottom-0 w-[90%] max-w-[400px] lg:w-full lg:static lg:h-[calc(100vh-120px)] lg:sticky lg:top-28 flex flex-col shadow-2xl lg:shadow-none">
              <div className="glass-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>
                {/* Chat Header */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(16,185,129,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>🤖</div>
                    <div>
                      <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)" }}>AI Health Assistant</p>
                      <p style={{ fontSize: "11px", color: isRecording ? "#ef4444" : transcribing ? "#f59e0b" : isSpeaking ? "#a78bfa" : "var(--accent)", display: "flex", alignItems: "center", gap: "4px" }}>
                        {isRecording ? "🔴 Recording…" : transcribing ? "⏳ Transcribing…" : isSpeaking ? "🔊 Speaking…" : "● Online"}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {/* TTS Toggle */}
                    <button
                      onClick={() => { setTtsEnabled((v) => !v); if (isSpeaking) stopSpeaking(); }}
                      title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
                      style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1px solid ${ttsEnabled ? "rgba(167,139,250,0.4)" : "var(--border)"}`, background: ttsEnabled ? "rgba(167,139,250,0.12)" : "transparent", color: ttsEnabled ? "#a78bfa" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", fontSize: "15px" }}
                    >
                      {ttsEnabled ? "🔊" : "🔇"}
                    </button>
                    {/* Stop speaking */}
                    {isSpeaking && (
                      <button onClick={stopSpeaking} title="Stop speaking" style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(167,139,250,0.4)", background: "rgba(167,139,250,0.12)", color: "#a78bfa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>⏹</button>
                    )}
                    <button onClick={() => { setShowChat(false); stopSpeaking(); }} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>✕</button>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px 16px" }}>
                      <p style={{ fontSize: "32px", marginBottom: "12px" }}>🩺</p>
                      <p style={{ fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px" }}>Describe your symptoms</p>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>Try: "I feel tired and weak" or "I am losing hair"</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "16px" }}>
                        {[
                          { icon: "💊", text: "I feel tired all day" },
                          { icon: "🦴", text: "My bones are fragile" },
                          { icon: "⚡", text: "I have low energy" },
                          { icon: "🛡️", text: "I'm stressed and can't sleep" },
                        ].map(({ icon, text }) => (
                          <button key={text} onClick={() => sendQuickReply(text)}
                            style={{ padding: "9px 12px", borderRadius: "10px", background: "var(--accent-light)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--accent)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }}>
                            <span>{icon}</span><span>{text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg) => (
                    <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "6px", alignItems: "flex-end" }}>
                      {msg.role === "assistant" && (
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🤖</div>
                      )}
                      <div style={{ maxWidth: "82%" }}>
                        <div style={{
                          borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                          padding: "10px 14px",
                          background: msg.role === "user" ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(255,255,255,0.06)",
                          border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                          color: "var(--text-primary)",
                        }}>
                          {msg.role === "assistant"
                            ? (
                              <>
                                <div className="prose prose-invert" style={{ fontSize: "13px", color: "white", lineHeight: "1.65" }}>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                                {msg.products && msg.products.length > 0 && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                                    {msg.products.map((p) => (
                                      <div key={p._id} 
                                        className="hover:bg-white/10 transition-colors"
                                        style={{ display: "flex", gap: "10px", alignItems: "center", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(16,185,129,0.3)", padding: "8px", borderRadius: "10px", cursor: "pointer" }}
                                      >
                                        <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                                          💊
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <p style={{ fontSize: "12px", fontWeight: "600", color: "white", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                                          <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>₹{p.price} • {p.category}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )
                            : <p style={{ fontSize: "14px", color: "white" }}>{msg.content}</p>
                          }
                        </div>
                        {/* Per-message replay button */}
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => speakText(msg.content)}
                            title="Read aloud"
                            style={{ marginTop: "4px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "11px", padding: "2px 4px", display: "flex", alignItems: "center", gap: "3px", opacity: 0.6, transition: "opacity 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                          >
                            🔊 <span>Read aloud</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div style={{ display: "flex", gap: "6px", padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: "16px 16px 16px 4px", width: "fit-content", border: "1px solid var(--border)" }}>
                      {[0, 150, 300].map((d) => (
                        <div key={d} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", animation: `bounce 1s ${d}ms infinite` }} />
                      ))}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                {isRecording ? (
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px", alignItems: "center", justifyContent: "space-between", background: "rgba(239,68,68,0.05)" }}>
                    <button type="button" onClick={cancelVoiceInput} style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
                      Cancel
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontSize: "14px", fontWeight: "600" }}>
                      <span style={{ animation: "pulse-mic 1s ease-in-out infinite", width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.6)" }}></span>
                      Recording...
                    </div>
                    <button type="button" onClick={stopVoiceInput} style={{ color: "#10b981", background: "rgba(16,185,129,0.1)", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}>
                      Send
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChat} style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px", alignItems: "center" }}>
                    {/* Mic Button */}
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      disabled={transcribing}
                      title="Start voice input"
                      style={{
                        flexShrink: 0,
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        background: transcribing ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.05)",
                        color: transcribing ? "#f59e0b" : "var(--text-muted)",
                        cursor: transcribing ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {transcribing ? (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                        </svg>
                      )}
                    </button>

                    <input id="chat-input" className="input-field" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      placeholder={transcribing ? "Transcribing…" : "Describe your symptoms…"}
                      disabled={chatLoading}
                      style={{ flex: 1, padding: "10px 14px", fontSize: "13px" }} />

                    <button type="submit" className="btn-primary" id="chat-send-btn" disabled={chatLoading || !chatInput.trim()}
                      style={{ flexShrink: 0, padding: "10px 14px", minWidth: "auto" }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                )}

              </div>
            </div>
          </aside>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-mic {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}

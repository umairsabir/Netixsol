"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("hc_token")) {
      router.replace("/products");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = tab === "login" ? "/auth/login" : "/auth/signup";
    const body =
      tab === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

    try {
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message || (Array.isArray(data?.message) ? data.message.join(", ") : "Something went wrong")
        );
      }

      localStorage.setItem("hc_token", data.token);
      localStorage.setItem("hc_user", JSON.stringify(data.user));
      router.push("/products");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-mesh min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              }}
            >
              🏥
            </div>
            <div>
              <h1
                className="gradient-text"
                style={{ fontSize: "28px", fontWeight: "800", lineHeight: "1" }}
              >
                MediStore
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                Smart Healthcare Products
              </p>
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Your AI-powered health companion
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: "32px" }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "28px",
            }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  background: tab === t ? "linear-gradient(135deg, #10b981, #059669)" : "transparent",
                  color: tab === t ? "white" : "var(--text-muted)",
                  boxShadow: tab === t ? "0 4px 12px rgba(16,185,129,0.3)" : "none",
                  fontFamily: "inherit",
                }}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {tab === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Full Name
                </label>
                <input
                  className="input-field"
                  type="text"
                  id="signup-name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Email Address
              </label>
              <input
                className="input-field"
                type="email"
                id="auth-email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>
                Password
              </label>
              <input
                className="input-field"
                type="password"
                id="auth-password"
                placeholder={tab === "signup" ? "At least 6 characters" : "Your password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  fontSize: "14px",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              id="auth-submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "4px", fontSize: "15px" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <div className="spinner" />
                  {tab === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                tab === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                fontFamily: "inherit",
              }}
            >
              {tab === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Features highlight */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginTop: "28px",
            flexWrap: "wrap",
          }}
        >
          {[
            { icon: "🤖", label: "AI Search" },
            { icon: "💊", label: "40+ Products" },
            { icon: "💬", label: "Chat Support" },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

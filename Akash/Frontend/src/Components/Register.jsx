import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "./api.js";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await api.register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (e) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Create an account</h2>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              style={input}
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={input}
              autoComplete="email"
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              style={input}
              autoComplete="new-password"
              required
            />
          </Field>
          {err && <div style={errBox}>{err}</div>}
          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Creating..." : "Register"}
          </button>
          <div style={{ fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: "#93c5fd" }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
      {children}
    </label>
  );
}

const wrap = { minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f172a", padding: 16, color: "#e5e7eb" };
const card = { width: "100%", maxWidth: 420, background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 24, boxShadow: "0 8px 30px rgba(0,0,0,.35)" };
const input = { padding: "10px 12px", borderRadius: 10, border: "1px solid #334155", background: "#0b1220", color: "#e5e7eb" };
const btn = { background: "#2563eb", color: "#fff", border: "none", padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 600 };
const errBox = { background: "#7f1d1d", border: "1px solid #ef4444", color: "#fecaca", padding: "8px 10px", borderRadius: 8 };

import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "./api.js"; // keep same path style as your Register file

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const redirectTo = state?.from?.pathname || "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await api.login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
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
              placeholder="••••••••"
              style={input}
              autoComplete="current-password"
              required
            />
          </Field>

          {err && <div style={errBox}>{err}</div>}

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div style={{ fontSize: 14 }}>
            No account?{" "}
            <Link to="/register" style={{ color: "#93c5fd" }}>
              Register
            </Link>
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

const wrap = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#0f172a",
  padding: 16,
  color: "#e5e7eb",
};
const card = {
  width: "100%",
  maxWidth: 420,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 30px rgba(0,0,0,.35)",
};
const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0b1220",
  color: "#e5e7eb",
};
const btn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};
const errBox = {
  background: "#7f1d1d",
  border: "1px solid #ef4444",
  color: "#fecaca",
  padding: "8px 10px",
  borderRadius: 8,
};

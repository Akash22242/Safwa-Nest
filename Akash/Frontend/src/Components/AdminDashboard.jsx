import React, { useEffect, useState } from "react";
import { api } from "./api.js"; // ✅ your merged API helper
import AdminLogin from "./AdminLogin.jsx"; // ✅ rendered only after login

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authed, setAuthed] = useState(false);

  // 🔐 On mount: check if we already have a session token and validate it
  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setMessage("Checking your admin session…");
      try {
        const res = await api.checkAdminSession(token);
        if (!cancelled) {
          if (res?.valid) {
            setAuthed(true);
            setMessage("✅ Session restored.");
          } else {
            sessionStorage.removeItem("adminToken");
            setAuthed(false);
            setMessage("⚠️ Session expired. Please log in again.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setAuthed(false);
          setMessage(`⚠️ ${err.message || "Failed to verify session."}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Verify admin password via backend API
  const verifyPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await api.verifyAdmin(password);
      if (data?.success) {
        // store the session token client-side (short-lived!)
        if (data.token) sessionStorage.setItem("adminToken", data.token);
        setAuthed(true);
        setPassword("");
        setMessage("✅ Access granted! Welcome, Admin.");
      } else {
        setMessage("❌ Invalid password. Try again.");
      }
    } catch (err) {
      setMessage(`⚠️ ${err.message || "Server error. Please try again later."}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    setAuthed(false);
    setPassword("");
    setMessage("👋 You’ve been logged out.");
  };

  // 👉 After login, render <AdminLogin /> (your post-login UI)
  if (authed) {
    return <AdminLogin onLogout={logout} />;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Verification</h1>

      <form onSubmit={verifyPassword} style={styles.form}>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
          disabled={loading}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      {message && (
        <p style={styles.message} aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    backgroundColor: "#0f172a",
    color: "#e5e7eb",
    borderRadius: 12,
    textAlign: "center",
    maxWidth: 400,
    margin: "2rem auto",
    boxShadow: "0 0 12px rgba(0,0,0,0.4)",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
    color: "#60a5fa",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #334155",
    fontSize: "1rem",
    backgroundColor: "#1e293b",
    color: "#e5e7eb",
  },
  button: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    transition: "background 0.2s ease",
  },
  message: {
    marginTop: "1rem",
    fontWeight: 500,
  },
};

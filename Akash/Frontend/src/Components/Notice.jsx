import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api.js";

export default function Notice() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.me()
      .then((res) => {
        setUser(res.user); // server returns user info if cookie is valid
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  if (loading) {
    return (
      <div style={wrap}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h2>Notice Board</h2>
        {user ? (
          <>
            <p>
              Welcome back, <b>{user.name}</b> ({user.email})
            </p>
            <p>Your session cookie is valid ✅</p>
          </>
        ) : (
          <p>No active session ❌</p>
        )}
      </div>
    </div>
  );
}

const wrap = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0f172a",
  color: "#e5e7eb",
  padding: 24,
};
const card = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 30px rgba(0,0,0,.35)",
  textAlign: "center",
};

// src/Components/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api.js";
import { getRoleFromCookie } from "./cookies.js";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [savingField, setSavingField] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // NEW
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api
      .me()
      .then((res) => {
        if (!active) return;
        const u = res.user || null;
        setUser(u);
        // Role from cookie OR API response
        const cookieRole = getRoleFromCookie();
        const roleApi = u?.role;
        const roles = Array.isArray(roleApi) ? roleApi : [roleApi];
        const admin = cookieRole === "admin" || roles.includes("admin");
        setIsAdmin(Boolean(admin));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        // Even if API fails, still check cookie role
        setIsAdmin(getRoleFromCookie() === "admin");
        setUser(null);
        setLoading(false);
        navigate("/login", { replace: true });
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const d = (v, fallback = "—") =>
    v === null || v === undefined || v === "" ? fallback : v;

  const fmtDateDisplay = (v) => {
    if (!v) return "—";
    try {
      const dt = new Date(v);
      return dt.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const fmtDateInput = (v) => {
    if (!v) return "";
    const dt = new Date(v);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  };

  const handleSave = async (field, rawValue) => {
    try {
      setSavingField(field);
      // Coerce certain fields
      let value = rawValue;
      if (field === "age") {
        value = rawValue === "" ? null : Number(rawValue);
        if (value !== null && (isNaN(value) || value < 0 || value > 120)) {
          throw new Error("Age must be a number between 0 and 120");
        }
      }
      if (field === "startWorkingDate") {
        value = rawValue ? new Date(rawValue).toISOString() : null;
      }

      // Optimistic UI update
      const next = { ...user, [field]: field === "startWorkingDate" ? value : rawValue };
      setUser(next);

      await api.updateSingle(field, value);

      setMsg("Saved ✔");
      setTimeout(() => setMsg(""), 1200);
    } catch (e) {
      setMsg(e.message || "Save failed");
    } finally {
      setSavingField("");
    }
  };

  if (loading) {
    return (
      <div style={wrap}>
        <div style={card}>
          <h2 style={{ margin: 0 }}>Profile</h2>
          <p style={{ color: "#9ca3af" }}>Loading your info…</p>
        </div>
      </div>
    );
  }

  // Editable rows configuration
  const rows = [
    {
      key: "name",
      label: "Name",
      type: "text",
      display: d(user?.name, "Unknown User"),
      initial: user?.name || "",
      placeholder: "Your name",
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      display: d(user?.email, "no-email@domain.tld"),
      initial: user?.email || "",
      placeholder: "you@example.com",
    },
    {
      key: "age",
      label: "Age",
      type: "number",
      display: d(user?.age),
      initial: user?.age ?? "",
      placeholder: "Optional",
    },
    {
      key: "startWorkingDate",
      label: "Start Working Date",
      type: "date",
      display: fmtDateDisplay(user?.startWorkingDate),
      initial: fmtDateInput(user?.startWorkingDate),
      placeholder: "",
    },
    // Read-only examples:
    { key: "_id", label: "User ID", readOnly: true, display: d(user?._id, "—") },
    { key: "createdAt", label: "Created At", readOnly: true, display: fmtDateDisplay(user?.createdAt) },
    { key: "updatedAt", label: "Updated At", readOnly: true, display: fmtDateDisplay(user?.updatedAt) },
  ];

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Profile</h2>
        {msg && <div style={toast}>{msg}</div>}

        <div style={grid}>
          {rows.map((r) => (
            <EditableField
              key={r.key}
              label={r.label}
              value={r.display}
              type={r.type}
              initial={r.initial}
              placeholder={r.placeholder}
              readOnly={r.readOnly}
              saving={savingField === r.key}
              onSave={(newVal) => handleSave(r.key, newVal)}
            />
          ))}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={btn} onClick={() => window.location.reload()}>
            Refresh
          </button>

          {/* NEW: Only visible to admins */}
          {isAdmin && (
            <button style={btn} onClick={() => navigate("/admin")}>
              Goto Admin Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  type = "text",
  initial = "",
  placeholder = "",
  readOnly = false,
  saving = false,
  onSave,
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initial);

  useEffect(() => {
    setVal(initial);
  }, [initial]);

  const startEdit = () => {
    if (readOnly) return;
    setEditing(true);
  };

  const cancel = () => {
    setVal(initial);
    setEditing(false);
  };

  const save = async () => {
    if (readOnly) return;
    await onSave(val);
    setEditing(false);
  };

  return (
    <div style={field}>
      <div style={labelStyle}>
        {label}
        {!readOnly && (
          <button
            onClick={startEdit}
            title="Edit"
            style={penBtn}
            aria-label={`Edit ${label}`}
          >
            ✏️
          </button>
        )}
      </div>

      {!editing || readOnly ? (
        <div style={valueStyle}>{value}</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            style={input}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={btn} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={cancel} style={btnGhost}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// styles (same palette)
const wrap = {
  minHeight: "100vh",
  background: "#0f172a",
  color: "#e5e7eb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
};

const card = {
  width: "100%",
  maxWidth: 720,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 30px rgba(0,0,0,.35)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 8,
};

const field = {
  display: "grid",
  gap: 6,
  padding: 12,
  border: "1px solid #334155",
  borderRadius: 10,
  background: "#0b1220",
  position: "relative",
};

const labelStyle = {
  fontSize: 12,
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const valueStyle = {
  fontSize: 15,
  color: "#e5e7eb",
  wordBreak: "break-word",
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
  border: "1px solid #1d4ed8",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const btnGhost = {
  background: "#111827",
  color: "#e5e7eb",
  border: "1px solid #334155",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

const penBtn = {
  marginLeft: "auto",
  background: "transparent",
  color: "#93c5fd",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "2px 6px",
  cursor: "pointer",
  fontSize: 12,
};

const toast = {
  background: "#0b1220",
  border: "1px solid #334155",
  color: "#93c5fd",
  padding: "8px 10px",
  borderRadius: 10,
  marginBottom: 12,
};

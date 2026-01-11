// src/Components/Attendance.jsx
import React, { useEffect, useRef, useState } from "react";
import { api } from "./api"; // keep your path

export default function Attendance() {
  const [inProgress, setInProgress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [startTime, setStartTime] = useState(null); // Date | null
  const [elapsed, setElapsed] = useState(0); // seconds
  const [logs, setLogs] = useState([]); // workLogs from employee
  const [monthStats, setMonthStats] = useState({ present: 0, absent: 0, days: [] });
  const intervalRef = useRef(null);

  // Format seconds -> H:M:S (zero-padded)
  const fmt = (secs) => {
    const s = Math.max(0, Math.floor(secs));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  };

  // utils
  const stripToYMD = (d) => {
    const dd = new Date(d);
    return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, "0")}-${String(dd.getDate()).padStart(2, "0")}`;
  };

  const getMonthInfo = (date = new Date()) => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0); // last day of month
    const daysInMonth = last.getDate();
    return { y, m, first, last, daysInMonth };
  };

  const recomputeMonthStats = (workLogs) => {
    const now = new Date();
    const { y, m, daysInMonth } = getMonthInfo(now);
    const today = now.getDate();

    // Build set of present days (any log with startTime in current month)
    const presentSet = new Set();
    (workLogs || []).forEach((log) => {
      if (!log?.startTime) return;
      const d = new Date(log.startTime);
      if (d.getFullYear() === y && d.getMonth() === m) {
        presentSet.add(d.getDate());
      }
    });

    // Build per-day list with color
    const days = [];
    let present = 0;
    let absent = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      if (day > today) {
        // Future day: white
        days.push({ day, status: "future" });
      } else if (presentSet.has(day)) {
        days.push({ day, status: "present" });
        present++;
      } else {
        days.push({ day, status: "absent" });
        absent++;
      }
    }

    setMonthStats({ present, absent, days });
  };

  // Start ticking when inProgress & startTime exist
  useEffect(() => {
    if (inProgress && startTime) {
      const tick = () => {
        setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      };
      tick(); // update immediately
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 1000);
      return () => clearInterval(intervalRef.current);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
  }, [inProgress, startTime]);

  // Bootstrap: check open session + load logs
  useEffect(() => {
    (async () => {
      try {
        // session status
        if (typeof api.punchStatus === "function") {
          const s = await api.punchStatus(); // { hasOpenLog, lastEntry }
          if (s?.hasOpenLog && s?.lastEntry?.startTime) {
            const st = new Date(s.lastEntry.startTime);
            setInProgress(true);
            setStartTime(st);
            setStatus(`Resumed active session from ${st.toLocaleTimeString()}`);
          }
        }

        // load logs from employee doc
        if (typeof api.getEmployee === "function") {
          const emp = await api.getEmployee(); // { employee }
          const wl = emp.employee?.workLogs || [];
          setLogs(wl);
          recomputeMonthStats(wl);
        }
      } catch (e) {
        setStatus(e.message || "Please login to use Attendance.");
      }
    })();
  }, []);

  const refetchLogs = async () => {
    try {
      const emp = await api.getEmployee();
      const wl = emp.employee?.workLogs || [];
      setLogs(wl);
      recomputeMonthStats(wl);
    } catch (e) {
      // ignore
    }
  };

  const handleStart = async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await api.punchStart(); // POST /api/me/punch?action=start
      const st = new Date(res.entry.startTime);
      setInProgress(true);
      setStartTime(st);
      setStatus(`Started at ${st.toLocaleTimeString()}`);
      await refetchLogs();
    } catch (e) {
      setStatus(e.message || "Failed to start");
      if ((e.message || "").toLowerCase().includes("already")) setInProgress(true);
    } finally {
      setBusy(false);
    }
  };

  const handleEnd = async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await api.punchEnd(); // POST /api/me/punch?action=end
      const t = new Date(res.entry.endTime).toLocaleTimeString();
      const h = res.entry.totalHours;
      setInProgress(false);
      setStartTime(null);
      setElapsed(0);
      setStatus(`Ended at ${t} — total ${h}h`);
      await refetchLogs();
    } catch (e) {
      setStatus(e.message || "Failed to end");
    } finally {
      setBusy(false);
    }
  };



  
  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Attendance</h2>

        {status && <div style={toast}>{status}</div>}

        {/* Live timer (different background) */}
        <div style={timerBox}>
          <div style={timerInner}>{fmt(elapsed)}</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={handleStart}
            disabled={busy || inProgress}
            style={{ ...btn, opacity: busy || inProgress ? 0.6 : 1 }}
          >
            {busy && !inProgress ? "…" : "Start"}
          </button>

          {inProgress && (
            <button
              onClick={handleEnd}
              disabled={busy}
              style={{ ...btn, background: "#059669", borderColor: "#047857", opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "…" : "End"}
            </button>
          )}
        </div>

        {/* Pie chart + counts */}
        <div style={row}>
          <div style={cardMini}>
            <h3 style={h3}>This Month</h3>
            <PieChart present={monthStats.present} absent={monthStats.absent} />
            <div style={legendWrap}>
              <LegendSwatch color="#10b981" label={`Present: ${monthStats.present}`} />
              <LegendSwatch color="#ef4444" label={`Absent: ${monthStats.absent}`} />
            </div>
          </div>

          {/* Month grid */}
          <div style={{ ...cardMini, flex: 2 }}>
            <h3 style={h3}>Days</h3>
            <MonthGrid days={monthStats.days} />
            <div style={legendWrap}>
              <LegendSwatch color="#10b981" label="Present" />
              <LegendSwatch color="#ef4444" label="Absent" />
              <LegendSwatch color="#ffffff" border="#334155" label="Future" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button style={btnGhost} onClick={refetchLogs}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------- Small components --------------------- */

function PieChart({ present, absent, size = 160, ring = 18 }) {
  const p = Math.max(0, Number(present) || 0);
  const a = Math.max(0, Number(absent) || 0);
  const total = p + a;

  // Percentages for conic gradient
  const pPct = total ? (p / total) * 100 : 0;
  const aPct = total ? (a / total) * 100 : 0;

  // Build background
  const bg = total
    ? `conic-gradient(#10b981 0 ${pPct}%, #ef4444 ${pPct}% ${pPct + aPct}%, #1f2937 ${pPct + aPct}% 100%)`
    : `conic-gradient(#334155 0 100%)`; // zero-state ring with better contrast

  const wrapStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    background: bg,
    margin: "8px auto",
    position: "relative",
    boxShadow: "0 0 0 1px #1f2937 inset",
  };

  // Inner hole to make it a donut
  const hole = {
    position: "absolute",
    inset: ring,
    borderRadius: "50%",
    background: "#0b1220",
    boxShadow: "0 0 0 1px #1f2937 inset",
  };

  // Center label
  const label = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 1.2,
  };

  return (
    <div style={wrapStyle}>
      <div style={hole} />
      <div style={label}>
        {total ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{p}/{total}</div>
            <div style={{ fontSize: 12, color: "#93c5fd" }}>days present</div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "#9ca3af" }}>No data yet</div>
        )}
      </div>
    </div>
  );
}

function MonthGrid({ days }) {
  const cell = (d) => {
    let bg = "#ffffff"; // future
    let color = "#0b1220";
    let border = "#334155";

    if (d.status === "present") {
      bg = "#10b981";
      color = "#06281f";
      border = "#0ea371";
    } else if (d.status === "absent") {
      bg = "#ef4444";
      color = "#450a0a";
      border = "#b91c1c";
    }

    return (
      <div key={d.day} style={{
        width: 34,
        height: 34,
        display: "grid",
        placeItems: "center",
        borderRadius: 8,
        background: bg,
        color,
        border: `1px solid ${border}`,
        fontWeight: 700,
        fontSize: 14,
      }}>
        {d.day}
      </div>
    );
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 34px)",
      gap: 8,
      alignContent: "start",
      justifyContent: "start",
      paddingTop: 4,
    }}>
      {Array.isArray(days) && days.map(cell)}
    </div>
  );
}

function LegendSwatch({ color, border, label }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: color || "#ffffff",
          border: `1px solid ${border || color}`,
          display: "inline-block",
        }}
      />
      <span style={{ color: "#e5e7eb", fontSize: 13 }}>{label}</span>
    </div>
  );
}

/* ===================== styles (dark palette) ===================== */
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
  maxWidth: 900,
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 30px rgba(0,0,0,.35)",
};

const timerBox = {
  background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", // different background
  padding: 8,
  borderRadius: 12,
  display: "inline-block",
  border: "1px solid #1d4ed8",
  marginBottom: 14,
};

const timerInner = {
  fontFamily: "monospace",
  fontSize: 36,
  padding: "10px 16px",
  background: "rgba(0,0,0,0.25)",
  borderRadius: 10,
  minWidth: 180,
  textAlign: "center",
  boxShadow: "inset 0 0 20px rgba(0,0,0,.2)",
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: 16,
  marginTop: 8,
};

const cardMini = {
  background: "#0b1220",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 16,
};

const h3 = {
  margin: 0,
  marginBottom: 8,
  fontSize: 14,
  color: "#93c5fd",
  fontWeight: 700,
};

const legendWrap = {
  display: "flex",
  gap: 16,
  marginTop: 10,
  flexWrap: "wrap",
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

const toast = {
  background: "#0b1220",
  border: "1px solid #334155",
  color: "#93c5fd",
  padding: "8px 10px",
  borderRadius: 10,
  marginBottom: 12,
};

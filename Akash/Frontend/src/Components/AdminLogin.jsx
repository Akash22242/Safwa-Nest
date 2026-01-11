import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

export default function AdminLogin({ tz = "Asia/Kolkata" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.getDailyWorkLogs({
          days: 10,
          tz,
          format: "grouped",
          includeOpen: true,
        });
        setData(res);
      } catch (e) {
        setErr(e.message || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [tz]);

  // ⬇️ call hooks BEFORE any return; also handle null data safely
  const sections = useMemo(() => {
    if (!data || !Array.isArray(data.data)) return [];
    return data.data.map((day) => {
      const rows = [];
      day.entries.forEach((emp) => {
        (emp.logs || []).forEach((log) => {
          rows.push({
            name: emp.name,
            email: emp.email,
            startTime: log.startTime,
            endTime: log.endTime,
            totalHours: log.totalHours,
            rating: log.rating ?? 0,
          });
        });
      });
      rows.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      return { date: day.date, grandTotalHours: day.grandTotalHours ?? 0, rows };
    });
  }, [data]);

  // Helper: format times consistently in requested timezone
  const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString(undefined, { timeZone: tz }) : "—";

  // Helper: nice “day name” for the section title
  const dayLabel = (isoDate) => {
    const midday = new Date(`${isoDate}T12:00:00Z`);
    const dow = new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: tz }).format(midday);
    const dmy = new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: tz,
    }).format(midday);
    return `${dow} — ${dmy}`;
  };

  // ✅ Early returns are fine now — all hooks have already run
  if (err) return <p style={{ color: "tomato" }}>{err}</p>;
  if (loading) return <p>Loading…</p>;
  if (sections.length === 0) return <p>No logs found.</p>;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>
        Work Logs — Last 10 Days <span style={styles.subtle}>({data.timezone})</span>
      </h2>

      {sections.map((day) => (
        <section key={day.date} style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>
              <strong>{dayLabel(day.date)}</strong>
              <span style={styles.dateCode}>({day.date})</span>
            </div>
            <div style={styles.sectionTotals}>
              Total: <b>{Number(day.grandTotalHours).toFixed(2)}</b> h
            </div>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table} aria-label={`Logs for ${day.date}`}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  {/* <th style={styles.th}>Email</th> */}
                  {/* <th style={styles.th}>Start</th> */}
                                    <th style={styles.th}>Hours</th>
                  <th style={styles.th}>End</th>

                  {/* <th style={styles.th}>Rating</th> */}
                </tr>
              </thead>
              <tbody>
                {day.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyCell}>No logs on this day.</td>
                  </tr>
                ) : (
                  day.rows.map((r, i) => {
                    const key = `${r.email}-${r.startTime || "na"}-${r.endTime || "open"}-${i}`;
                    return (
                      <tr key={key}>
                        <td style={styles.tdName}>{r.name}</td>
                        {/* <td style={styles.tdEmail} title={r.email}>{r.email}</td> */}
                        {/* <td style={styles.td}>{fmtDateTime(r.startTime)}</td> */}
                        
                        <td style={styles.tdRight}>
                          {r.totalHours != null ? Number(r.totalHours).toFixed(2) : "—"}
                        </td>
                        <td style={styles.td}>
                          {r.endTime ? fmtDateTime(r.endTime) : <i>running</i>}
                        </td>
                        {/* <td style={styles.tdRight}>{r.rating ?? 0}</td> */}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

const styles = {
  wrapper: { maxWidth: 1100, margin: "2rem auto", padding: "0 1rem" },
  heading: { fontSize: "1.4rem", marginBottom: "0.75rem", color: "#e5e7eb" },
  subtle: { color: "#94a3b8", fontWeight: 400, marginLeft: 6 },
  section: {
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 12,
    boxShadow: "0 0 12px rgba(0,0,0,0.35)",
    marginBottom: "1rem",
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.85rem 1rem",
    background: "#0b1220",
    borderBottom: "1px solid #1f2937",
    color: "#e5e7eb",
  },
  sectionTitle: { display: "flex", alignItems: "center", gap: "0.5rem" },
  dateCode: { color: "#93c5fd", fontSize: 12 },
  sectionTotals: { color: "#93c5fd" },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 760 },
  th: {
    textAlign: "left", fontWeight: 600, fontSize: 13, padding: "10px 12px",
    background: "#111827", color: "#93c5fd", borderBottom: "1px solid #1f2937", position: "sticky", top: 0,
  },
  td: { padding: "10px 12px", borderBottom: "1px solid #1f2937", color: "#e5e7eb", whiteSpace: "nowrap" },
  tdRight: { padding: "10px 12px", borderBottom: "1px solid #1f2937", color: "#e5e7eb", textAlign: "right", whiteSpace: "nowrap" },
  tdName: { padding: "10px 12px", borderBottom: "1px solid #1f2937", color: "#e5e7eb", fontWeight: 600, whiteSpace: "nowrap" },
  tdEmail: {
    padding: "10px 12px", borderBottom: "1px solid #1f2937", color: "#cbd5e1",
    maxWidth: 280, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap",
  },
  emptyCell: { padding: "12px", textAlign: "center", color: "#94a3b8" },
};

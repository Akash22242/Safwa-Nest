// src/api.js
const BASE_URL = import.meta.env.VITE_API_URL || ""; // proxy handles /api/*

async function jsonFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // keep cookies (auth/admin session)
    ...options,
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : null;

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // ===== AUTH =====
  login: (email, password) =>
    jsonFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    jsonFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => jsonFetch("/api/auth/me"),

  logout: () => jsonFetch("/api/auth/logout", { method: "POST" }),

  // ===== EMPLOYEE =====
  updateEmployee: (field, value) =>
    jsonFetch("/api/me/employee/update", {
      method: "PATCH",
      body: JSON.stringify({ field, value }),
    }),

  getEmployee: () => jsonFetch("/api/me/employee"),

  // ===== ATTENDANCE =====
  punchStart: () => jsonFetch("/api/me/punch?action=start", { method: "POST" }),
  punchEnd: () => jsonFetch("/api/me/punch?action=end", { method: "POST" }),
  punchStatus: () => jsonFetch("/api/me/punch/status"),

  // ===== ADMIN (added/merged) =====
  // Verifies admin password; server should set an HttpOnly admin-session cookie.
  verifyAdmin: (password) =>
    jsonFetch("/api/admin/verify-admin", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  notifyPunch: (payload) =>
    jsonFetch("/api/me/notify/punch", {
      method: "POST",
      body: JSON.stringify(payload), // { type, entry, logs, monthStats, tz }
    }),


  // Checks whether the admin session cookie is valid.
  checkAdminSession: () => jsonFetch("/api/admin/session"), // GET recommended

  // Logs out the admin (clears the admin-session cookie).
  adminLogout: () => jsonFetch("/api/admin/logout", { method: "POST" }),

  // ===== REPORTING / WORKLOGS (for your frontend) =====
  /**
   * Fetch latest day-wise logs (grouped by day, latest day first by default).
   * Options:
   *   - days (default 1) – number of most-recent days to return
   *   - tz (default "UTC") – IANA timezone for day boundaries
   *   - format "grouped" | "flat" (default "grouped")
   *   - includeOpen (default false) – include logs without endTime
   *   - start/end (ISO strings) – mainly for format=flat
   *   - email/name – optional filters
   */
  getDailyWorkLogs: ({
    days = 1,
    tz = "UTC",
    format = "grouped",
    includeOpen = false,
    start,
    end,
    email,
    name,
  } = {}) => {
    const qs = new URLSearchParams({
      days: String(days),
      tz,
      format,
      includeOpen: String(includeOpen),
    });
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    if (email) qs.set("email", email);
    if (name) qs.set("name", name);

    return jsonFetch(`/api/worklogs/daily?${qs.toString()}`);
  },
};

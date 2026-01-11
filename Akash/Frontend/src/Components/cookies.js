// src/Components/cookies.js
export function getCookie(name) {
  const nameEq = `${name}=`;
  const found = document.cookie.split("; ").find((row) => row.startsWith(nameEq));
  return found ? found.slice(nameEq.length) : null;
}

/** 
 * Tries common cookie keys and returns a clean role string (e.g., "admin").
 * Order: role, user_role, userRole
 */
export function getRoleFromCookie() {
  const candidates = ["role", "user_role", "userRole"];
  for (const key of candidates) {
    const raw = getCookie(key);
    if (raw) {
      // decode & strip possible quotes
      try {
        return decodeURIComponent(raw).replace(/^"|"$/g, "");
      } catch {
        return raw.replace(/^"|"$/g, "");
      }
    }
  }
  return null;
}

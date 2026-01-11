export function jwtCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const secure = String(process.env.COOKIE_SECURE || "").toLowerCase() === "true" || isProd;

  return {
    httpOnly: true,
    secure,                 // true on HTTPS
    sameSite: secure ? "none" : "lax", // "none" if cross-site & secure
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  };
}

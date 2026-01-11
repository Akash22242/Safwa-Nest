import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "./api.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api
      .me()
      .then(() => active && setIsAuth(true))
      .catch(() => active && setIsAuth(false));
    return () => {
      active = false;
    };
  }, []);

  const onLogout = async () => {
    try {
      await api.logout();
    } catch (_) {
      // ignore; still redirect
    } finally {
      setIsAuth(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.brand}>
          <div style={styles.logo}>𝑳𝒐𝒈𝒐</div>
          <span style={styles.brandText}>YourCompany</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={styles.navDesktop}>
          <NavItem to="/notice" label="Notice" />
          <NavItem to="/attendance" label="Attendance" />
          <NavItem to="/profile" label="Profile" />
          <NavItem to="/about" label="About Company" />
          <NavItem to="/admin" label="Admin" />
        </nav>

        {/* Actions (Desktop) */}
        <div style={styles.actionsDesktop}>
          {isAuth ? (
            <button onClick={onLogout} style={styles.logoutBtn} title="Logout">
              Logout
            </button>
          ) : (
            <Link to="/login" style={styles.loginLink}>
              Login
            </Link>
          )}
        </div>

        {/* Burger (Mobile toggle) */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          style={styles.burger}
        >
          <span style={styles.burgerBar} />
          <span style={styles.burgerBar} />
          <span style={styles.burgerBar} />
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={styles.navMobile}>
          <MobileItem to="/notice" label="Notice" onClick={() => setOpen(false)} />
          <MobileItem to="/attendance" label="Attendance" onClick={() => setOpen(false)} />
          <MobileItem to="/profile" label="Profile" onClick={() => setOpen(false)} />
          <MobileItem to="/about" label="About Company" onClick={() => setOpen(false)} />
          <MobileItem to="/admin" label="Admin" onClick={() => setOpen(false)} />

          <div style={{ height: 6 }} />

          {/* Logout/Login (Mobile) */}
          {isAuth ? (
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              style={styles.mobileLogoutBtn}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              style={styles.mobileLoginLink}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

/* Subcomponents */
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...styles.link,
        ...(isActive ? styles.linkActive : null),
      })}
    >
      {label}
    </NavLink>
  );
}

function MobileItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        ...styles.mobileLink,
        ...(isActive ? styles.mobileLinkActive : null),
      })}
    >
      {label}
    </NavLink>
  );
}

/* Styles */
const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#0f172a",
    borderBottom: "1px solid #1f2937",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto",
    alignItems: "center",
    padding: "10px 16px",
    gap: 12,
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#2563eb",
    display: "grid",
    placeItems: "center",
    color: "white",
    fontSize: 12,
    fontWeight: 800,
  },
  brandText: {
    color: "#e5e7eb",
    fontWeight: 700,
    letterSpacing: "0.2px",
  },
  navDesktop: {
    display: "none",
    gap: 10,
    justifySelf: "center",
  },
  link: {
    color: "#93c5fd",
    padding: "8px 12px",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid transparent",
  },
  linkActive: {
    border: "1px solid #334155",
    background: "#111827",
    color: "#e5e7eb",
  },
  actionsDesktop: {
    display: "none",
    gap: 10,
    alignItems: "center",
  },
  loginLink: {
    color: "#93c5fd",
    padding: "8px 12px",
    borderRadius: 10,
    textDecoration: "none",
    border: "1px solid #334155",
    background: "#111827",
  },
  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "1px solid #7f1d1d",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  burger: {
    justifySelf: "end",
    width: 42,
    height: 38,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#111827",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
  burgerBar: {
    width: 18,
    height: 2,
    background: "#e5e7eb",
    margin: "2px 0",
    display: "block",
  },
  navMobile: {
    borderTop: "1px solid #1f2937",
    background: "#0b1220",
    display: "grid",
    gap: 4,
    padding: "8px 8px 12px",
  },
  mobileLink: {
    display: "block",
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#e5e7eb",
    border: "1px solid transparent",
  },
  mobileLinkActive: {
    border: "1px solid #334155",
    background: "#111827",
  },
  mobileLoginLink: {
    display: "block",
    marginTop: 4,
    padding: "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#93c5fd",
    border: "1px solid #334155",
    background: "#111827",
    textAlign: "center",
    fontWeight: 600,
  },
  mobileLogoutBtn: {
    display: "block",
    width: "100%",
    marginTop: 4,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #7f1d1d",
    background: "#7f1d1d",
    color: "#fecaca",
    textAlign: "center",
    fontWeight: 700,
    cursor: "pointer",
  },
};

/* Media Query: Enable desktop layout ≥ 800px */
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @media (min-width: 800px) {
      header > div[style] { grid-template-columns: auto 1fr auto auto !important; }
      nav[style] { display: inline-flex !important; }
      div[style*="actionsDesktop"] { display: inline-flex !important; }
      button[aria-label="Toggle menu"] { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

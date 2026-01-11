import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./Components/Navbar.jsx";
import Home from "./Components/Home.jsx";
import Login from "./Components/Login.jsx";
import Register from "./Components/Register.jsx";

import Notice from "./Components/Notice.jsx";
import Attendance from "./Components/Attendence.jsx"; // keep your spelling
import Profile from "./Components/Profile.jsx";
import About from "./Components/About.jsx";
import AdminDashboard from "./Components/AdminDashboard.jsx"; // ✅ Admin page
import { api } from "./Components/api.js";

// 🔒 Auth gate: redirects to /login if not authenticated
function RequireAuth({ children }) {
  const [loading, setLoading] = React.useState(true);
  const [isAuth, setIsAuth] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    let active = true;
    api
      .me()
      .then(() => active && setIsAuth(true))
      .catch(() => active && setIsAuth(false))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Checking authentication...</div>;
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route index element={<RequireAuth><Notice /></RequireAuth>} />
          <Route path="/notice" element={<RequireAuth><Notice /></RequireAuth>} />
          <Route path="/attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />

          {/* ✅ Admin page works like normal authenticated route */}
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/notice" replace />} />
        </Routes>
      </main>
    </>
  );
}

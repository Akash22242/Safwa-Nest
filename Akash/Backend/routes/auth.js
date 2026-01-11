// server/routes/auth.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { jwtCookieOptions } from "../middleware/cookie.js";

const router = Router();

/**
 * Helper: sign a JWT and attach it to cookies
 */
function issueToken(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
  res.cookie("token", token, jwtCookieOptions());
  return token;
}

/* --------------------------------------------------------------------------
   POST /api/auth/register
   Creates a new user and logs them in
--------------------------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });

    issueToken(res, user);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------------------------------------------------------
   POST /api/auth/login
   Logs an existing user in and returns user info
--------------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    issueToken(res, user);

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------------------------------------------------------
   POST /api/auth/logout
--------------------------------------------------------------------------- */
router.post("/logout", (req, res) => {
  res.cookie("token", "", { ...jwtCookieOptions(), maxAge: 0 });
  return res.json({ message: "Logged out" });
});

/* --------------------------------------------------------------------------
   GET /api/auth/me
--------------------------------------------------------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email createdAt updatedAt");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

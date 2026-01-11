import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * PATCH /api/me/update
 * Body: { field, value }
 * Allowed fields: name, email, age, startWorkingDate
 */
router.patch("/update", requireAuth, async (req, res) => {
  try {
    const { field, value } = req.body || {};

    const ALLOWED = new Set(["name", "email", "age", "startWorkingDate"]);
    if (!field || !ALLOWED.has(field)) {
      return res.status(400).json({ message: "Invalid field" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Coerce + validate
    if (field === "age") {
      if (value === null || value === "" || typeof value === "undefined") {
        user.age = undefined;
      } else {
        const n = Number(value);
        if (Number.isNaN(n) || n < 0 || n > 120) {
          return res.status(400).json({ message: "Age must be 0–120" });
        }
        user.age = n;
      }
    } else if (field === "startWorkingDate") {
      if (!value) {
        user.startWorkingDate = undefined;
      } else {
        const d = new Date(value);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ message: "Invalid date" });
        }
        user.startWorkingDate = d;
      }
    } else if (field === "email") {
      if (typeof value !== "string" || !value.includes("@")) {
        return res.status(400).json({ message: "Invalid email" });
      }
      user.email = value.toLowerCase().trim();
    } else if (field === "name") {
      if (typeof value !== "string" || value.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 chars" });
      }
      user.name = value.trim();
    }

    await user.save(); // may throw 11000 on duplicate email

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        startWorkingDate: user.startWorkingDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

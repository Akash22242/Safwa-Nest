import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "No authentication token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id name email");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { id: user._id, name: user.name, email: user.email };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ message: "Authentication failed" });
  }
}

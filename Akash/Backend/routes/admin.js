import express from "express";
const router = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
console.log("🔐 Loaded ADMIN_PASSWORD:", ADMIN_PASSWORD); // <-- add this

router.post("/verify-admin", (req, res) => {
  const { password } = req.body;
  console.log("Received password:", password);

  if (!password)
    return res.status(400).json({ success: false, message: "Password is required" });

  if (password === "123")
    return res.json({ success: true, message: "Access granted" });

  return res.status(401).json({ success: false, message: "Invalid password" });
});

export default router;

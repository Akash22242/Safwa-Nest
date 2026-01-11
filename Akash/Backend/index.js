// server/index.js  (or Backend/index.js)

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// reconstruct __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ load .env relative to this file
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Debug log
console.log("🧩 Loaded .env from:", path.resolve(__dirname, ".env"));
console.log("🔐 ADMIN_PASSWORD =", process.env.ADMIN_PASSWORD);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";
import employeeRoutes from "./routes/employee.routes.js";
import Employee from "./models/Employee.js";
import adminRoutes from "./routes/admin.js";
import worklogsRouter from "./routes/worklogs.js";
const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authdemo";
const ALLOWED = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ✅ Allow frontend access
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (ALLOWED.includes(origin)) return cb(null, true);
      cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// ✅ Health Check
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("API is running"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api", employeeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/worklogs", worklogsRouter);
// ✅ Check admin password loaded
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();
console.log("🧩 Final ADMIN_PASSWORD =", JSON.stringify(ADMIN_PASSWORD));

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected:", MONGO_URI);

    // Optional seed data
    if (process.env.SEED_ON_BOOT === "true") {
      const exists = await Employee.findOne({
        email: "demo.employee@example.com",
      });
      if (!exists) {
        await Employee.create({
          name: "Demo Employee",
          email: "demo.employee@example.com",
          age: 26,
          startWorkingDate: new Date(),
          rating: 3,
          workLogs: [],
        });
        console.log("Inserted demo employee");
      }
    }

    app.listen(PORT, "127.0.0.1", () =>
      console.log(`✅ API running at http://127.0.0.1:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  }
})();

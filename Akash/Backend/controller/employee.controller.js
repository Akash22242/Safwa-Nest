// server/controllers/employee.controller.js
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

/* ---------------------------------------------
   Helpers
---------------------------------------------- */
export async function getEmployeeForCookieUser(req) {
  const token = req.cookies?.token;
  if (!token) throw new Error("No authentication token found in cookies.");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded?.id) throw new Error("Invalid token payload.");

  const user = await User.findById(decoded.id).select("name email");
  if (!user) throw new Error("User not found.");

  let employee = await Employee.findOne({ email: user.email });
  if (!employee) {
    employee = await Employee.create({
      name: user.name || "Unknown",
      email: user.email,
      startWorkingDate: new Date(),
      rating: 0,
      workLogs: [],
    });
  }

  return employee;
}

function hoursBetween(start, end) {
  return Math.round(((end - start) / (1000 * 60 * 60)) * 100) / 100;
}

/* ---------------------------------------------
   Mailer
---------------------------------------------- */
function renderTemplate(fileName, vars = {}) {
  const filePath = path.join(process.cwd(), "templates", fileName);
  let html = fs.readFileSync(filePath, "utf8");
  for (const [k, v] of Object.entries(vars)) {
    html = html.replace(new RegExp(`{{${k}}}`, "g"), v);
  }
  return html;
}

async function sendMail(to, subject, templateFile, vars) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ Mailer skipped: SMTP credentials not configured.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = renderTemplate(templateFile, vars);
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

/* ---------------------------------------------
   Controllers
---------------------------------------------- */
export async function getEmployee(req, res) {
  try {
    const employee = await getEmployeeForCookieUser(req);
    res.json({ employee });
  } catch (err) {
    res.status(401).json({ message: err.message || "Unauthorized" });
  }
}

export async function punch(req, res) {
  try {
    const employee = await getEmployeeForCookieUser(req);
    const now = new Date();
    const action = (req.query.action || "").toLowerCase();

    const last = employee.workLogs.at(-1) || null;
    const hasOpen = !!(last && !last.endTime);
    const tz = "Asia/Kolkata";

    if (action === "start") {
      if (hasOpen) return res.status(400).json({ message: "Session already running." });

      employee.workLogs.push({ startTime: now });
      await employee.save();

      await sendMail(employee.email, "Work Started", "start.html", {
        name: employee.name,
        date: now.toLocaleDateString("en-IN", { timeZone: tz }),
        startTime: now.toLocaleTimeString("en-IN", { timeZone: tz }),
      });

      return res.json({ message: "Work started", entry: employee.workLogs.at(-1) });
    }

    if (action === "end") {
      if (!hasOpen) return res.status(400).json({ message: "No active session." });

      last.endTime = now;
      last.totalHours = hoursBetween(last.startTime, last.endTime);
      await employee.save();

      await sendMail(employee.email, "Work Ended", "end.html", {
        name: employee.name,
        startTime: new Date(last.startTime).toLocaleTimeString("en-IN", { timeZone: tz }),
        endTime: now.toLocaleTimeString("en-IN", { timeZone: tz }),
        hours: last.totalHours,
      });

      return res.json({ message: "Work ended", entry: last });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (err) {
    console.error("Punch error:", err);
    res.status(401).json({ message: err.message || "Unauthorized" });
  }
}

export async function punchStatus(req, res) {
  try {
    const employee = await getEmployeeForCookieUser(req);
    const last = employee.workLogs.at(-1) || null;
    const hasOpenLog = !!(last && !last.endTime);
    res.json({ hasOpenLog, lastEntry: last });
  } catch (err) {
    res.status(401).json({ message: err.message || "Unauthorized" });
  }
}

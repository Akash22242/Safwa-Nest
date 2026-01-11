// server/routes/employee.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getEmployee,
  punch,
  punchStatus,
} from "../controller/employee.controller.js";

const router = Router();

/* ---------------------------------------------
   Employee Routes
---------------------------------------------- */

// Fetch current employee (for logged-in user)
router.get("/me/employee", requireAuth, getEmployee);

// Punch start / end
router.post("/me/punch", requireAuth, punch);

// Punch status
router.get("/me/punch/status", requireAuth, punchStatus);

export default router;

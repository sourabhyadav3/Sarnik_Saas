import express from "express";
import {
  createTimeLogs,
  getAllTimeLogs,
  getAllTimeLogsEmployeeWithTask,
  getByIdTimeLogs,
  getTimeLogsAllEmployee,
  getTimeLogsByEmployee,
  getTimeLogsByProduction,
  removeTimeLogs,
  updateTimeLogs
} from "../Controllers/timeLogsCtrl.js";
import { authenticate } from "../Middlewares/AuthMiddleware.js";
import { requireTenant } from "../Middlewares/tenantMiddleware.js";

const router = express.Router();

// Apply tenant security globally for all time logs routes
router.use(authenticate, requireTenant);

router.post("/time-logs", createTimeLogs);
router.get("/time-logs", getAllTimeLogs);
router.get(
  /^\/time-logs\/employee(?:\/(\d+))?\/job\/(\d+)$/,
  getAllTimeLogsEmployeeWithTask
);
router.get("/time-logs/:id", getByIdTimeLogs);
router.put("/time-logs/:id", updateTimeLogs);
router.delete("/time-logs/:id", removeTimeLogs);
router.get("/time-logs/onlyemployeeall/all", getTimeLogsAllEmployee);
router.get("/time-logs/employee/:employeeId", getTimeLogsByEmployee);
router.get("/time-logs/production/:productionId", getTimeLogsByProduction);

export default router;

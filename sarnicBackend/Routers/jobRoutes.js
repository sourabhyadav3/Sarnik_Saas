import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  getJobsByProjectId,
  updateJob,
  deleteJob,
  getJobHistoryByEmployeeId,
  getJobHistoryByProductionId
} from "../Controllers/JobCtrl.js";
import { authenticate } from "../Middlewares/AuthMiddleware.js";
import { requireTenant } from "../Middlewares/tenantMiddleware.js";
import { validateTask } from "../Middlewares/validationMiddleware.js";
import { auditMiddleware } from "../helpers/auditHelper.js";

const router = express.Router();

// Apply tenant security globally for all job routes
router.use(authenticate, requireTenant);

router.post("/jobs", validateTask, auditMiddleware("CREATE", "TASK"), createJob);
router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJobById);
router.get("/jobs/project/:projectId", getJobsByProjectId);
router.get("/jobs/jobhistoryemployee/:employeeId", getJobHistoryByEmployeeId);
router.get("/jobs/jobHistoryproduction/:productionId", getJobHistoryByProductionId);
router.put("/jobs/:id", auditMiddleware("UPDATE", "TASK"), updateJob);
router.delete("/jobs/:id", auditMiddleware("DELETE", "TASK"), deleteJob);

export default router;


import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByStatus,
  getProjectOverviewById
} from "../Controllers/projectCtrl.js";
import { authenticate } from "../Middlewares/AuthMiddleware.js";
import { requireTenant } from "../Middlewares/tenantMiddleware.js";
import { validateProject } from "../Middlewares/validationMiddleware.js";
import { auditMiddleware } from "../helpers/auditHelper.js";

const router = express.Router();

// Apply tenant security globally for all project routes
router.use(authenticate, requireTenant);

router.post("/projects", validateProject, auditMiddleware("CREATE", "PROJECT"), createProject);
router.get("/projects", getAllProjects);
router.get("/projects/:id", getProjectById);
router.get("/projects/overview/:id", getProjectOverviewById);
router.put("/projects/:id", validateProject, auditMiddleware("UPDATE", "PROJECT"), updateProject);
router.delete("/projects/:id", auditMiddleware("DELETE", "PROJECT"), deleteProject);

// Status tabs
router.get("/projects/status/:status", getProjectsByStatus);

export default router;


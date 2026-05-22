import express from "express";
import {
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getAdminDashboard
} from "../Controllers/CompanyCtrl.js";
import { validateCompanyCreation } from "../Middlewares/validationMiddleware.js";
import { auditMiddleware } from "../helpers/auditHelper.js";

const router = express.Router();

router.post("/company", validateCompanyCreation, auditMiddleware("CREATE", "COMPANY"), createCompany);
router.get("/admindashboard", getAdminDashboard);
router.get("/company/:id", getCompanyById);
router.put("/company/:id", auditMiddleware("UPDATE", "COMPANY"), updateCompany);
router.delete("/company/:id", auditMiddleware("DELETE", "COMPANY"), deleteCompany);

export default router;


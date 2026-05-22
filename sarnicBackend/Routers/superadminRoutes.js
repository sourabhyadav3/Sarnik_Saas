import express from "express";
import { authenticate } from "../Middlewares/authMiddleware.js";
import { requireSuperAdmin } from "../Middlewares/roleMiddleware.js";
import {
  getSuperAdminDashboard,
  getSaasCompanies,
  createSaasCompany,
  updateSaasCompany,
  deleteSaasCompany,
  getSuperAdminUsers,
  getSuperAdminRevenue,
  getSuperAdminAnalytics,
  getSaasSubscriptions,
  createSaasSubscription,
  updateSaasSubscription,
} from "../Controllers/superadminCtrl.js";
import { validateSubscription, validateCompanyCreation } from "../Middlewares/validationMiddleware.js";
import { auditMiddleware } from "../helpers/auditHelper.js";

const router = express.Router();

router.use(authenticate, requireSuperAdmin);

router.get("/superadmin/dashboard", getSuperAdminDashboard);
router.get("/superadmin/companies", getSaasCompanies);
router.post("/superadmin/company/create", validateCompanyCreation, auditMiddleware("CREATE", "COMPANY"), createSaasCompany);
router.put("/superadmin/company/:id", auditMiddleware("UPDATE", "COMPANY"), updateSaasCompany);
router.delete("/superadmin/company/:id", auditMiddleware("DELETE", "COMPANY"), deleteSaasCompany);
router.get("/superadmin/users", getSuperAdminUsers);

// Add isolated revenue, analytics, and subscription routes
router.get("/superadmin/revenue", getSuperAdminRevenue);
router.get("/superadmin/analytics", getSuperAdminAnalytics);
router.get("/superadmin/subscriptions", getSaasSubscriptions);
router.post("/superadmin/subscription/create", validateSubscription, auditMiddleware("CREATE", "SUBSCRIPTION"), createSaasSubscription);
router.put("/superadmin/subscription/:id", auditMiddleware("UPDATE", "SUBSCRIPTION"), updateSaasSubscription);

export default router;



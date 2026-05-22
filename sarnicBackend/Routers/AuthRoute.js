import express from "express";
import {
    createUser,
    deleteUser,
    getUsers,
    changePassword,
    getUserById,
    updateUser,
    login,
    refresh,
    logout,
    getProductionUsers,
    getEmployeeUsers,
    validateSession
} from "../Controllers/AuthCtrl.js";
import { authenticate } from "../Middlewares/AuthMiddleware.js";
import { requireTenant } from "../Middlewares/tenantMiddleware.js";
import { validateLogin } from "../Middlewares/validationMiddleware.js";

const router = express.Router();

// Public routes
router.post("/auth/login", validateLogin, login);
router.post("/auth/refresh", refresh);
router.post("/auth/logout", logout);

// Private/Isolated routes (with session active state verification)
router.post("/users", authenticate, requireTenant, validateSession, createUser);
router.get("/users", authenticate, requireTenant, validateSession, getUsers);
router.get("/users/:id", authenticate, requireTenant, validateSession, getUserById);
router.put("/users/:id", authenticate, requireTenant, validateSession, updateUser);
router.delete("/users/:id", authenticate, requireTenant, validateSession, deleteUser);
router.put("/users/change-password/:id", authenticate, requireTenant, validateSession, changePassword);
router.get("/production", authenticate, requireTenant, validateSession, getProductionUsers);
router.get("/employee", authenticate, requireTenant, validateSession, getEmployeeUsers);

export default router;

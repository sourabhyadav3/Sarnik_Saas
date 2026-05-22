import { ALL_ROLES } from "../utils/roles.js";

/**
 * @param {...string} allowedRoles
 * Must run after authenticate middleware.
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

export const requireSuperAdmin = requireRoles("superadmin");

/** Validates role_name on user creation (optional helper) */
export const isValidRole = (role) => ALL_ROLES.includes(role);

/**
 * Reusable tenant middleware.
 * Must be mounted after the 'authenticate' middleware.
 * Extracts companyId from req.user and attaches req.tenant.
 */
export const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required for tenant context",
    });
  }

  const companyId = req.user.companyId ?? null;
  const isSuperAdmin = req.user.role === "superadmin";

  // Attach tenant context
  req.tenant = {
    companyId,
    isIsolated: !isSuperAdmin,
  };

  next();
};

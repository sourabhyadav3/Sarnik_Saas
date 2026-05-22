import { pool } from "../Config/dbConnect.js";

/**
 * Enterprise Audit Logger.
 * Writes records to the audit_logs table asynchronously.
 * 
 * @param {Object} logParams
 * @param {number|null} logParams.userId - ID of the actor
 * @param {string|null} logParams.userEmail - Email of the actor
 * @param {string} logParams.action - Action name (e.g. LOGIN, CREATE, UPDATE, DELETE, PLAN_RENEW)
 * @param {string} logParams.module - Module name (e.g. AUTH, PROJECT, SUBSCRIPTION, TASK)
 * @param {number|null} logParams.companyId - Tenant company context
 * @param {string|Object|null} logParams.details - Optional text or JSON metadata description of the action
 * @param {string|null} logParams.ipAddress - Actor's IP address
 */
export const logAudit = async ({
  userId = null,
  userEmail = null,
  action,
  module,
  companyId = null,
  details = null,
  ipAddress = null,
}) => {
  try {
    const serializedDetails =
      typeof details === "object" && details !== null
        ? JSON.stringify(details)
        : details;

    await pool.query(
      `
      INSERT INTO audit_logs 
      (user_id, user_email, action, module, company_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        userId,
        userEmail,
        action.toUpperCase(),
        module.toUpperCase(),
        companyId,
        serializedDetails,
        ipAddress,
      ]
    );
  } catch (error) {
    // Fail silently in production to ensure audit logging errors do not crash key business transactions
    console.error("❌ Failed to write audit log entry:", error);
  }
};

/**
 * Express middleware helper to automatically capture client IP and user context
 * for standard create/update/delete operations.
 */
export const auditMiddleware = (action, module) => {
  return async (req, res, next) => {
    // Capture details from request if needed, or trigger post-response hook
    const originalSend = res.send;
    
    res.send = function (body) {
      res.send = originalSend;
      res.send(body);

      // Perform audit log execution after response succeeds
      try {
        const statusCode = res.statusCode;
        if (statusCode >= 200 && statusCode < 300) {
          const user = req.user || {};
          const tenant = req.tenant || {};
          const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

          let targetDetails = `Request path: ${req.originalUrl}`;
          if (req.method === "POST" || req.method === "PUT") {
            const bodyCopy = { ...req.body };
            // Scrub password field to keep credentials safe in audit logs
            if (bodyCopy.password) bodyCopy.password = "********";
            targetDetails += ` | Data: ${JSON.stringify(bodyCopy)}`;
          }

          logAudit({
            userId: user.id || null,
            userEmail: user.email || null,
            action: `${req.method}_${action}`,
            module: module,
            companyId: tenant.companyId || user.companyId || null,
            details: targetDetails,
            ipAddress: clientIp,
          });
        }
      } catch (err) {
        console.error("❌ Audit logging intercept failed:", err);
      }
    };

    next();
  };
};

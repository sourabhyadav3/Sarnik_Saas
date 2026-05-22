import jwt from "jsonwebtoken";

/**
 * Generate a short-lived access token (default: 1 hour).
 */
export const generateAccessToken = (userId, role, companyId = null) => {
  const payload = {
    id: userId,
    role,
  };

  if (companyId !== null && companyId !== undefined) {
    payload.companyId = companyId;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "1h",
  });
};

/**
 * Generate a long-lived refresh token (default: 30 days).
 */
export const generateRefreshToken = (userId, role, companyId = null) => {
  const payload = {
    id: userId,
    role,
  };

  if (companyId !== null && companyId !== undefined) {
    payload.companyId = companyId;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Backward-compatible alias for existing endpoints
export const generatetoken = (userId, role, companyId = null) => {
  return generateAccessToken(userId, role, companyId);
};

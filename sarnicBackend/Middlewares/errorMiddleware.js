import { sendError } from "../utils/apiResponse.js";

/**
 * Centralized error handler middleware.
 * Converts DB errors, validation errors, and custom exceptions into unified standard payloads.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Global Error Handler Caught Exception:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "An unexpected error occurred on the server";

  // Handle unique constraint or foreign key DB violations cleanly
  if (err.code === "ER_DUP_ENTRY") {
    return sendError(res, "A record with this unique attribute already exists", err, 409);
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return sendError(res, "Referenced item does not exist (Integrity check failed)", err, 400);
  }

  return sendError(res, message, err, statusCode);
};

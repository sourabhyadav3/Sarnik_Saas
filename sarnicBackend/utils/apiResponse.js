/**
 * Unified API Response standardizers.
 * Ensuring consistent payload delivery: { success, message, data, error }
 */

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
};

export const sendError = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
    data: null,
    error: null,
  };

  if (error) {
    if (process.env.NODE_ENV === "development") {
      response.error = error.stack || error.toString() || error;
    } else {
      response.error = error.message || error.toString();
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Native async middleware wrapper to catch asynchronous errors and forward them
 * to the centralized error handling middleware, eliminating the need for repetitive try-catch blocks.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

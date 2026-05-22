import rateLimit from "express-rate-limit";

// Tighter rate limit for authentication endpoints (login, refresh, password changes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  message: {
    success: false,
    message: "Too many authentication attempts from this IP, please try again after 15 minutes",
    data: null,
    error: "RateLimitError"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard rate limit for general workspace and transaction APIs
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please slow down.",
    data: null,
    error: "RateLimitError"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Recursive request payload sanitizer.
 * Scrubs malicious XSS script vectors (HTML tags, script structures, javascript: URLs)
 * from req.body, req.query, and req.params transparently.
 */
export const sanitizePayload = (req, res, next) => {
  const sanitize = (val) => {
    if (typeof val === "string") {
      // 1. Strip script tags
      let clean = val.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
      // 2. Strip standard HTML tags (leaving pure content)
      clean = clean.replace(/<[^>]*>/g, "");
      // 3. Prevent javascript scheme injection
      clean = clean.replace(/javascript:/gi, "");
      return clean.trim();
    }
    if (typeof val === "object" && val !== null) {
      for (const key in val) {
        val[key] = sanitize(val[key]);
      }
    }
    return val;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};

/**
 * Hardened manual security headers middleware (fallback overlay alongside Helmet).
 */
export const secureHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3001 http://localhost:5173 http://localhost:5174 sarnic-latest-one.netlify.app;"
  );
  next();
};

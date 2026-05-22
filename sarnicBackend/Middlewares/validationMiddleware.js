import { sendError } from "../utils/apiResponse.js";

/**
 * Helper to validate email format using regular expressions.
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Reusable payload validation runner.
 * Takes a validation spec object and runs checks.
 */
const runValidation = (req, res, next, spec) => {
  const errors = [];
  const body = req.body || {};

  for (const field in spec) {
    const rules = spec[field];
    const val = body[field];

    // 1. Required check
    if (rules.required && (val === undefined || val === null || val === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (val !== undefined && val !== null && val !== "") {
      // 2. Email format check
      if (rules.email && !isValidEmail(val)) {
        errors.push(`${field} must be a valid email address`);
      }

      // 3. Minimum length check
      if (rules.minLength && String(val).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }

      // 4. Numeric type check
      if (rules.numeric && isNaN(Number(val))) {
        errors.push(`${field} must be a valid number`);
      }

      // 5. Array check
      if (rules.array && !Array.isArray(val)) {
        errors.push(`${field} must be a valid array`);
      }
    }
  }

  if (errors.length > 0) {
    return sendError(
      res,
      "Validation failed: " + errors.join(", "),
      { validationErrors: errors },
      400
    );
  }

  next();
};

export const validateLogin = (req, res, next) => {
  runValidation(req, res, next, {
    email: { required: true, email: true },
    password: { required: true, minLength: 6 },
  });
};

export const validateCompanyCreation = (req, res, next) => {
  runValidation(req, res, next, {
    company_name: { required: true, minLength: 2 },
  });
};

export const validateSubscription = (req, res, next) => {
  runValidation(req, res, next, {
    company_id: { required: true, numeric: true },
    plan_name: { required: true, minLength: 3 },
    price: { required: true, numeric: true },
    duration_months: { required: true, numeric: true },
  });
};

export const validateProject = (req, res, next) => {
  runValidation(req, res, next, {
    project_name: { required: true, minLength: 2 },
  });
};

export const validateTask = (req, res, next) => {
  runValidation(req, res, next, {
    project_id: { required: true, numeric: true },
    job_no: { required: true },
    priority: { required: true },
    pack_size: { required: true },
  });
};

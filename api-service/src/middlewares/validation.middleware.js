import { body, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import { LANGUAGES } from "../constants.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new ApiError(400, "Validation failed", errorMessages);
  }
  next();
};

export const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  
  handleValidationErrors,
];

export const validateSubmission = [
  body("problem_id")
    .notEmpty()
    .withMessage("Problem ID is required")
    .isMongoId()
    .withMessage("Invalid problem ID"),
  
  body("language")
    .notEmpty()
    .withMessage("Language is required")
    .isIn(LANGUAGES)
    .withMessage(`Language must be one of: ${LANGUAGES.join(", ")}`),
  
  body("source_code")
    .notEmpty()
    .withMessage("Source code is required")
    .isLength({ max: 50000 })
    .withMessage("Source code too large (max 50KB)"),
  
  handleValidationErrors,
];

export const validateProblem = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title too long"),
  
  body("description")
    .notEmpty()
    .withMessage("Description is required"),
  
  body("difficulty")
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be Easy, Medium, or Hard"),
  
  body("hidden_test_cases")
    .isArray({ min: 1 })
    .withMessage("At least one test case is required"),
  
  body("time_limit")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Time limit must be 1-30 seconds"),
  
  body("memory_limit")
    .optional()
    .isInt({ min: 64, max: 1024 })
    .withMessage("Memory limit must be 64-1024 MB"),
  
  handleValidationErrors,
];

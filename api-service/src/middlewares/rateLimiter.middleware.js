import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new ApiError(429, "Too many requests, please try again later");
  },
});

// Stricter rate limiter for submissions
// Note: This will rate limit by IP address for all authenticated users
export const submissionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 submissions per minute
  message: "Too many submissions, please wait before submitting again",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new ApiError(
      429, 
      "Submission limit exceeded. Please wait 1 minute before submitting again"
    );
  },
});

// Auth rate limiter (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    throw new ApiError(429, "Too many login attempts, please try again later");
  },
});

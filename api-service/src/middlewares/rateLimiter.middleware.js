import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new ApiError(429, "Too many requests, please try again later");
  },
});

// Stricter rate limiter for submissions
export const submissionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 submissions per minute per user
  message: "Too many submissions, please wait before submitting again",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user, not IP
    return req.user?._id?.toString() || req.ip;
  },
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
  max: 10, // 10 attempts per 15 minutes
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    throw new ApiError(429, "Too many login attempts, please try again later");
  },
});

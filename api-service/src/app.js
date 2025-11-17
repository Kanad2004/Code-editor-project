import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { ApiError } from "./utils/ApiError.js";

const app = express();

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsers with different limits
app.use(express.json({ limit: "100kb" })); // Increased for code submissions
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(7);
  res.setHeader('X-Request-Id', req.id);
  next();
});

// --- Import routes ---
import healthRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import problemRouter from "./routes/problem.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import userRouter from "./routes/user.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";

// --- Declare routes ---
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/problems", problemRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/users", userRouter);
app.use("/api/leaderboard", leaderboardRouter);

// 404 handler - must be AFTER all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// --- Main Error Handler ---
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message),
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [`Duplicate value for ${field}`],
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: ['Please login again'],
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      errors: ['Please login again'],
    });
  }

  // For unhandled errors
  console.error(`[${req.id}] Unhandled error:`, err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export { app };

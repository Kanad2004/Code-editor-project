import { Router } from "express";
import {
  createSubmission,
  testSubmission,
  getMySubmissions,
  getSubmissionStatus,
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { submissionRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { validateSubmission } from "../middlewares/validation.middleware.js";

const router = Router();

// All submission routes are protected
router.use(verifyJWT);

router.route("/")
  .post(submissionRateLimiter, validateSubmission, createSubmission);

router.route("/test")
  .post(submissionRateLimiter, validateSubmission, testSubmission);

router.route("/my-submissions")
  .get(getMySubmissions);

router.route("/:submission_id")
  .get(getSubmissionStatus);

export default router;

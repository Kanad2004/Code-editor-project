import { Router } from "express";
import {
  createSubmission,
  getAllSubmissions,
  getSubmissionStatus,
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All submission routes are protected
router.use(verifyJWT);

router.route("/").post(createSubmission).get(getAllSubmissions);
router.route("/:submission_id").get(getSubmissionStatus);

export default router;
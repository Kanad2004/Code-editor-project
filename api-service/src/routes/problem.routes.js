import { Router } from "express";
import {
  createProblem,
  getAllProblems,
  getProblemBySlug,
  updateProblem,
  deleteProblem,
} from "../controllers/problem.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { validateProblem } from "../middlewares/validation.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getAllProblems);
router.route("/:slug").get(getProblemBySlug);

// Admin only routes
router.route("/").post(verifyJWT, verifyAdmin, validateProblem, createProblem);
router.route("/:slug").put(verifyJWT, verifyAdmin, updateProblem);
router.route("/:slug").delete(verifyJWT, verifyAdmin, deleteProblem);

export default router;

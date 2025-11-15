import { Router } from "express";
import {
  createProblem,
  getAllProblems,
  getProblemBySlug,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All problem routes are protected
router.use(verifyJWT);

router.route("/").post(createProblem).get(getAllProblems);
router.route("/:slug").get(getProblemBySlug);

export default router;
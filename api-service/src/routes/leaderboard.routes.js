import { Router } from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

// Public route
router.route("/").get(getLeaderboard);

export default router;

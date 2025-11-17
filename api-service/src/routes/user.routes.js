import { Router } from "express";
import { getUserStats, getRecentActivity } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected routes
router.use(verifyJWT);

router.route("/stats").get(getUserStats);
router.route("/recent-activity").get(getRecentActivity);

export default router;

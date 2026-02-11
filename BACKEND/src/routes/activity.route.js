import express from "express";
import { getUserActivities, markActivitiesAsRead } from "../controllers/activity.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verifyJwt, getUserActivities);
router.post("/read", verifyJwt, markActivitiesAsRead);

export default router;
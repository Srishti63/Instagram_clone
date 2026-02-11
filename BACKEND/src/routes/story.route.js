import express from "express";
import { 
    postStory,
    getActiveStories,
    markStorySeen,
    ViewersList
} from "../controllers/story.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // Make sure this matches your multer config

const router = express.Router();
router.post("/", verifyJwt, upload.fields([{ name: "media", maxCount: 1 }]), postStory);
router.get("/", verifyJwt, getActiveStories);
router.post("/:storyId/seen", verifyJwt, markStorySeen);
router.get("/:storyId/viewers", verifyJwt, ViewersList);

export default router;
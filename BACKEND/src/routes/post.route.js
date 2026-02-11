import express from "express";
import { 
    CreatePost,
    getFeedPosts,
    EditPost,
    deletePost,
    toggleLikeOnPost
} from "../controllers/post.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/", verifyJwt, upload.fields([{ name: "media", maxCount: 1 }]), CreatePost);
router.get("/", verifyJwt, getFeedPosts);
router.put("/:postId", verifyJwt, EditPost);
router.delete("/:postId", verifyJwt, deletePost);
router.post("/:postId/like", verifyJwt, toggleLikeOnPost);

export default router;
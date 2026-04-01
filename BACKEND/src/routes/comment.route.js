import express from "express";
import {
  addCommentOnPost,
  getPostComments,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/:postId", verifyJwt, addCommentOnPost);
router.get("/:postId", verifyJwt, getPostComments);
router.delete("/c/:commentId", verifyJwt, deleteComment);

export default router;
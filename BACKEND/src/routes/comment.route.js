import express from "express";
import {
  addCommentOnPost,
  getPostComments,
  deleteComment
} from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.js";

const router = express.Router();
router.post("/:postId", verifyJwt, addCommentOnPost);
router.get("/:postId", verifyJwt, getPostComments);
router.delete("/:commentId", verifyJwt, deleteComment);

export default router;
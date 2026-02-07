import {asyncHandler} from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";

const addCommentOnPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, "Comment text is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    owner: userId,
    text
  });
  if (post.owner.toString() !== userId.toString()) {
    await createActivity({
      type: "post_comment",
      actor: userId,
      recipient: post.owner,
      post: postId
    });
  }

  res.status(201).json(
    new ApiResponse(
      201,
      comment,
      "Comment added successfully"
    )
  );
});

const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const comments = await Comment.find({ post: postId })
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(
      200,
      comments,
      "Post comments fetched successfully"
    )
  );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // sirf comment owner delete kar sakta hai
  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Comment deleted successfully"
    )
  );
});

export {
    addCommentOnPost,
    getPostComments,
    deleteComment
}
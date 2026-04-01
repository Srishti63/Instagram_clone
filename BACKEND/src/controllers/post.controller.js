import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import postService from "../services/post.service.js";
import { likeContent } from "../services/likeService.js";
import { Post } from "../models/post.model.js";

const CreatePost = asyncHandler(async (req, res) => {
    const post = await postService.createPost({
        userId: req.user._id,
        mediaLocalPath: req.files?.media?.[0]?.path,
        caption: req.body.caption
    });

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post uploaded successfully"));
});

const getExplorePosts = asyncHandler(async (req, res) => {
    const data = await postService.getExplorePosts(req.query);

    res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Explore posts fetched successfully"
        )
    );
});

const getUserPosts = asyncHandler(async (req, res) => {
    const posts = await postService.getUserPosts(req.params.userId);

    res.status(200).json(
        new ApiResponse(200, posts, "User posts fetched successfully")
    );
});

const EditPost = asyncHandler(async (req, res) => {
    const post = await postService.editPost({
        postId: req.params.postId,
        userId: req.user._id,
        caption: req.body.caption
    });

    res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    await postService.deletePost({
        postId: req.params.postId,
        userId: req.user._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const toggleLikeOnPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const result = await likeContent({
        userId: req.user._id,
        contentOwnerId: post.owner,
        contentId: post._id,
        type: "POST" // We will update likeService to handle this parameter (OCP)
    });

    res.status(200).json(
        new ApiResponse(200, result, "like toggled successfully")
    );
});

export { CreatePost, getExplorePosts, getUserPosts, EditPost, deletePost, toggleLikeOnPost };

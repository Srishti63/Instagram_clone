import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { createActivity } from "./activity.controller.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import notificationService from "../services/notificationService.js";
import { likeContent } from "../services/likeService.js";

const CreatePost = asyncHandler(async (req, res) => {
  const mediaLocalPath = req.files?.media?.[0]?.path;
  const { captions } = req.body;

  if (!mediaLocalPath) {
    throw new ApiError(400, "No MEDIA found");
  }

  const uploadedMedia = await uploadOnCloudinary(mediaLocalPath);

  if (!uploadedMedia) {
    throw new ApiError(401, "Media Upload failed");
  }

  const post = await Post.create({
  owner: req.user._id,
  mediaUrl: uploadedMedia.secure_url,
  mediaPublicId: uploadedMedia.public_id,
  mediaType: uploadedMedia.resource_type,
  captions
});

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post uploaded successfully"));
});

const getExplorePosts = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("owner", "username avatar");

  const totalPosts = await Post.countDocuments();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        posts,
      },
      "Explore posts fetched successfully",
    ),
  );
});

const EditPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { captions = "" } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post Not Found");
  }

  if (post.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to edit the post");
  }

  post.caption = captions;
  await post.save();

  res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }

  if (post.mediaPublicId) {
    try {
      await deleteFromCloudinary(post.mediaPublicId);
    } catch (error) {
      console.error("Cloudinary delete failed:", error.message);
    }
  }

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

/*const toggleLikeOnPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(400, "No Post found ");
  }

  let isLiked;

  if (post.likes.includes(userId)) {
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true },
    );
    isLiked = false;
  } else {
    await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: false },
    );
    isLiked = true;
    if (post.owner.toString() !== userId.toString()) {
       await createActivity({
        type: "post_like",
        actor: userId,
        recipient: post.owner,
        post: postId,

      await notificationService.notify({
        type: "LIKE",
        senderId: userId,
        recipientId: post.owner,
        postId: postId,
      });
    }
  }

  const upadatedPost = await Post.findById(post).select("likes");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked,
        likesCount: upadatedPost.likes.length,
      },
      "like toggled successfully",
    ),
  );
});*/

const toggleLikeOnPost = asyncHandler(async(req,res)=>{

  const post = await Post.findById(req.params.postId);

  const result = await likeContent({
    userId :req.user._id,
    contentOwnerId : post.owner, 
    contentId : post._id,
    type: "POST"
  })

  res.status(200).json(
    new ApiResponse(200,result,"liked toggled successfully")
  );
})

export { CreatePost, getExplorePosts, EditPost, deletePost, toggleLikeOnPost };

import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

class PostService {
    async createPost({ userId, mediaLocalPath, caption }) {
        if (!mediaLocalPath) {
            throw new ApiError(400, "No MEDIA found");
        }

        const uploadedMedia = await uploadOnCloudinary(mediaLocalPath);

        if (!uploadedMedia) {
            throw new ApiError(401, "Media Upload failed");
        }

        const post = await Post.create({
            owner: userId,
            mediaUrl: uploadedMedia.secure_url,
            mediaPublicId: uploadedMedia.public_id,
            mediaType: uploadedMedia.resource_type,
            caption
        });

        return post;
    }

    async getExplorePosts({ page = 1, limit = 10 }) {
        page = parseInt(page);
        limit = parseInt(limit);

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("owner", "username avatar");

        const totalPosts = await Post.countDocuments();

        return {
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            posts,
        };
    }

    async editPost({ postId, userId, caption = "" }) {
        const post = await Post.findById(postId);

        if (!post) {
            throw new ApiError(404, "Post Not Found");
        }

        if (post.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not allowed to edit the post");
        }

        post.caption = caption;
        await post.save();

        return post;
    }

    async deletePost({ postId, userId }) {
        const post = await Post.findById(postId);

        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        if (post.owner.toString() !== userId.toString()) {
            throw new ApiError(403, "You are not allowed to delete this post");
        }

        if (post.mediaPublicId) {
            try {
                // If there's a specific deleteFromCloudinary method from cloudinary.js, import and use it.
                // Assuming cloudinary.uploader.destroy since it's standard and used in userService.
                await cloudinary.uploader.destroy(post.mediaPublicId);
            } catch (error) {
                console.error("Cloudinary delete failed:", error.message);
            }
        }

        await Post.findByIdAndDelete(postId);
    }
}

export default new PostService();

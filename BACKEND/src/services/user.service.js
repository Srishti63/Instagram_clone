import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

class UserService {
    async updateAvatar(userId, filePath) {
        if (!filePath) {
            throw new ApiError(400, "Avatar file is required");
        }

        const user = await User.findById(userId);

        const uploadedAvatar = await uploadOnCloudinary(filePath);

        if (!uploadedAvatar) {
            throw new ApiError(500, "Avatar upload failed");
        }

        if (user.avatar?.public_id) {
            try {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            } catch (err) {
                console.log("Old avatar deletion failed:", err);
            }
        }

        user.avatar = {
            url: uploadedAvatar.secure_url,
            public_id: uploadedAvatar.public_id
        };

        await user.save({ validateBeforeSave: false });
        
        const updatedUser = await User.findById(user._id).select("-password -refreshToken");
        return updatedUser;
    }

    async getUserProfile(userId) {
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        return user;
    }

    async updateUserBio(userId, bio) {
        if (!bio || bio.trim() === "") {
            throw new ApiError(400, "Bio is required");
        }
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        user.bio = bio;
        await user.save({ validateBeforeSave: false });
        return user;
    }
}

export default new UserService();

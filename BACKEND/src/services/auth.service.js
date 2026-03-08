import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import emailService from "./email.service.js";
import { redisClient } from "../utils/redisClient.js";
import jwt from "jsonwebtoken";
import dns from "dns/promises";
import crypto from "crypto";
import {
    verifyOtpFromRedis,
    storeOtp,
    setCooldown,
    checkCooldown,
    getLoginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts,
} from "../utils/redishelpers.js";

class AuthService {
    constructor() {}

    async generateAccessAndRefreshToken(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
        } catch (err) {
            console.log("Token generation error:", err);
            throw new ApiError(401, "Error while generating access and refresh token");
        }
    }

    async checkEmailDomain(email) {
        email = email.trim().toLowerCase();
        const parts = email.split("@");
        if (parts.length !== 2) return false;
        const domain = parts[1];
        try {
            const mxRecords = await dns.resolveMx(domain);
            return mxRecords.length > 0;
        } catch (err) {
            console.log("DNS error:", err.message);
            return false;
        }
    }

    generateOTP() {
        return crypto.randomBytes(3).toString("hex");
    }

    async registerUser({ username, email, password }) {
        if ([username, email, password].some(field => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        username = username.trim();
        email = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new ApiError(400, "Password must be strong");
        }

        const isValidDomain = await this.checkEmailDomain(email);
        if (!isValidDomain) {
            throw new ApiError(400, "Email domain does not exist");
        }

        const existedUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        let user = existedUser;

        if (existedUser) {
            if (existedUser.isVerified) {
                const isEmailTaken = existedUser.email === email;
                throw new ApiError(400, isEmailTaken ? "Email already registered" : "Username already taken");
            }

            // If the user exists but is NOT verified, they probably abandoned the previous signup.
            // We allow them to overwrite the unverified account with this new attempt.
            existedUser.username = username.toLowerCase();
            existedUser.email = email;
            existedUser.password = password; // The mongoose pre-save hook will hash this
            await existedUser.save();
        } else {
            user = await User.create({
                username: username.toLowerCase(),
                email,
                password
            });
        }

        const otp = this.generateOTP();

        await storeOtp("verify", user._id.toString(), otp);
        await emailService.sendOtpEmail(user.email, otp);

        return user;
    }

    async loginUser({ username, email, password }) {
        if (!password) {
            throw new ApiError(400, "Password is required");
        }

        const identifier = (email || username).trim().toLowerCase();

        if (!identifier) {
            throw new ApiError(400, "Username or Email is required");
        }

        const attempts = await getLoginAttempts(identifier);

        if (attempts && attempts >= 5) {
            throw new ApiError(403, "Too many failed attempts. Try again later.");
        }

        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user) {
            await incrementLoginAttempts(identifier);
            throw new ApiError(400, "Invalid Credentials");
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            const newAttempts = await incrementLoginAttempts(identifier);
            if (newAttempts >= 5) {
                throw new ApiError(403, "Account locked for 15 minutes.");
            }
            throw new ApiError(400, "Invalid Credentials");
        }

        if (!user.isVerified) {
            throw new ApiError(403, "Please verify your email first");
        }

        await resetLoginAttempts(identifier);

        const { accessToken, refreshToken } = await this.generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        return { user: loggedInUser, accessToken, refreshToken };
    }

    async logoutUser(userId) {
        await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
    }

    async refreshAccessToken(incomingRefreshToken) {
        if (!incomingRefreshToken) {
            throw new ApiError(404, "Unauthorized Request");
        }

        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );

            const user = await User.findById(decodedToken?._id);

            if (!user) {
                throw new ApiError(404, "Invalid refresh token");
            }

            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used");
            }

            const { accessToken, refreshToken: newRefreshToken } = await this.generateAccessAndRefreshToken(user._id);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            throw new ApiError(401, err?.message || "Invalid refresh token");
        }
    }

    async verifyEmailOtp({ email, otp }) {
        const cleanEmail = email?.trim().toLowerCase();
        const cleanOtp = otp?.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) throw new ApiError(404, "User not found");

        await verifyOtpFromRedis("verify", user._id.toString(), cleanOtp);

        user.isVerified = true;
        await user.save();
    }

    async resendOtp({ email }) {
        const user = await User.findOne({ email });
        if (!user) throw new ApiError(404, "User not found");

        const isCooldown = await checkCooldown("verify", user._id.toString());
        if (isCooldown) {
            throw new ApiError(400, "Please wait before requesting OTP again");
        }

        const otp = this.generateOTP();

        await storeOtp("verify", user._id.toString(), otp);
        await setCooldown("verify", user._id.toString());
        await emailService.sendOtpEmail(user.email, otp);
    }

    async forgotPassword({ email }) {
        const user = await User.findOne({ email });
        if (!user) return; // If user doesn't exist, we just return to avoid leaking existence

        const isCooldown = await checkCooldown("forgot", user._id.toString());
        if (isCooldown) {
            throw new ApiError(400, "Please wait before requesting OTP again");
        }

        const otp = this.generateOTP();

        await storeOtp("forgot", user._id.toString(), otp);
        await setCooldown("forgot", user._id.toString());
        await emailService.sendOtpEmail(user.email, otp);
    }

    async verifyForgotOtp({ email, otp }) {
        const cleanEmail = email?.trim().toLowerCase();
        const cleanOtp = otp?.trim().toLowerCase();

        const user = await User.findOne({ email: cleanEmail });
        if (!user) throw new ApiError(404, "User not found");

        await verifyOtpFromRedis("forgot", user._id.toString(), cleanOtp);

        await redisClient.set(`reset:allowed:${user._id}`, "true", { EX: 600 });
    }

    async resetPassword({ email, newPassword }) {
        const user = await User.findOne({ email });
        if (!user) throw new ApiError(404, "User not found");

        const allowed = await redisClient.get(`reset:allowed:${user._id}`);
        if (!allowed) {
            throw new ApiError(403, "Password reset not authorized");
        }

        user.password = newPassword;
        await user.save();

        await redisClient.del(`reset:allowed:${user._id}`);
    }
}

export default new AuthService();

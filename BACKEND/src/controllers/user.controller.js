import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";

const RegisterUser = asyncHandler(async (req, res) => {
    await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, null, "User registered. OTP sent to email."));
});

const loginUser = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user, accessToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async(req,res)=>{
    await authService.logoutUser(req.user._id);

    const options = { httpOnly: true, secure: true };
    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(201, {}, "User LoggedOut Successfully"));
});

const getCurrUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const { accessToken, refreshToken: newrefreshToken } = await authService.refreshAccessToken(incomingRefreshToken);

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newrefreshToken }, "Access token refreshed"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateAvatar(req.user._id, req.file?.path);
    return res.status(200).json(new ApiResponse(200, updatedUser, "User's avatar updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user._id;
    const user = await userService.getUserProfile(userId, req.user._id);
    return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateUserBio = asyncHandler(async (req, res) => {
    const user = await userService.updateUserBio(req.user._id, req.body.bio);
    return res.status(200).json(new ApiResponse(200, user, "User bio updated successfully"));
});

const verifyEmailOtp = asyncHandler(async (req, res) => {
    await authService.verifyEmailOtp({ email: req.body.email, otp: req.body.otp });
    res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

const resendOtp = asyncHandler(async (req, res) => {
    await authService.resendOtp({ email: req.body.email });
    res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword({ email: req.body.email });
    // Keep original message if desired, or "OTP sent successfully"
    res.status(200).json(new ApiResponse(200, {}, "OTP sent successfully"));
});

const verifyForgotOtp = asyncHandler(async (req, res) => {
    await authService.verifyForgotOtp({ email: req.body.email, otp: req.body.otp });
    res.status(200).json(new ApiResponse(200, {}, "OTP verified. You may reset password."));
});

const resetPassword = asyncHandler(async (req, res) => {
    await authService.resetPassword({ email: req.body.email, newPassword: req.body.newPassword });
    res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
});

export {
    RegisterUser, loginUser, logoutUser, getCurrUser, refreshAccessToken,
    updateAvatar, getUserProfile, updateUserBio, verifyEmailOtp, resendOtp,
    forgotPassword, verifyForgotOtp, resetPassword
};

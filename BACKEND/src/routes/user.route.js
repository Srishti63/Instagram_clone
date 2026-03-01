import express from "express";
import { 
    RegisterUser,
    loginUser,
    logoutUser,
    getCurrUser,
    refreshAccessToken,
    updateAvatar,
    getUserProfile,
    updateUserBio,
    verifyEmailOtp,
    resendOtp,
    forgotPassword,
    verifyForgotOtp,
    resetPassword
} from "../controllers/user.controller.js";

import { toggleFollow,
         getFollowers,
         getFollowings
     } from "../controllers/follow.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; 

const router = express.Router();

router.post("/register", RegisterUser);

router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-email-otp", resendOtp);

router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);

router.post("/login", loginUser);
router.post("/logout", verifyJwt, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", verifyJwt, getCurrUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/avatar", verifyJwt, upload.single("avatar"), updateAvatar); 
router.get("/profile/:id", verifyJwt, getUserProfile);
router.put("/bio", verifyJwt, updateUserBio);

router.post("/follow/:id", verifyJwt, toggleFollow);
router.get("/followers/:id", verifyJwt, getFollowers);
router.get("/following/:id", verifyJwt, getFollowings);

export default router;
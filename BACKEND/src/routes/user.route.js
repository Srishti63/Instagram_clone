import express from "express";
import { 
    RegisterUser,
    loginUser,
    logoutUser,
    getCurrUser,
    refreshAccessToken,
    updateAvatar,
    getUserProfile,
    updateUserBio
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; 

const router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", loginUser);
router.post("/logout", verifyJwt, logoutUser);
router.get("/me", verifyJwt, getCurrUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/avatar", verifyJwt, upload.single("avatar"), updateAvatar); 
router.get("/profile/:id", verifyJwt, getUserProfile);
router.put("/bio", verifyJwt, updateUserBio);

export default router;
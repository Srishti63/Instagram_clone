import {asyncHandler} from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {v2 as cloudinary} from "cloudinary";
import jwt from "jsonwebtoken";
import dns from "dns/promises";
import { sendmail } from "../utils/sendemail.js";
import { redisClient } from "../utils/redisClient.js";
import { verifyOtpFromRedis,
        storeOtp,
        setCooldown,
        checkCooldown, 
        getLoginAttempts,
        incrementLoginAttempts,
        resetLoginAttempts,
       } from "../utils/redishelpers.js";
import crypto from "crypto";

const generateAccessAndRefreshToken = async (userId) => {
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
};

const checkEmailDomain = async (email) => {
   // console.log("EMAIL:", email);
  //  console.log("TYPE:", typeof email);

    email = email.trim().toLowerCase();

    const parts = email.split("@");
    if (parts.length !== 2) return false;

    const domain = parts[1];

    //console.log("Checking domain:", domain);

    try {
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords.length > 0;
    } catch (err) {
        console.log("DNS error:", err.message);
        return false;
    }
};

const generateOTP = () => {
    return crypto.randomBytes(3).toString("hex");
};

const RegisterUser = asyncHandler(async (req, res) => {
    let { username, email, password } = req.body;

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

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

     const isValidDomain = await checkEmailDomain(email);
    if (!isValidDomain) {
        throw new ApiError(400, "Email domain does not exist");
    }

    if (existedUser) {
        throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    });

    //user.emailOtp = otp;
    //user.emailOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    //await user.save();
    const otp = generateOTP();

    await storeOtp("verify", user._id.toString(), otp);
    await sendmail(user.email, otp);

    res.status(201).json(
        new ApiResponse(201, null, "User registered. OTP sent to email.")
    );
});


const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const identifier = email || username;

  if (!identifier) {
    throw new ApiError(400, "Username or Email is required");
  }

  const attempts = await getLoginAttempts(identifier);

  if (attempts && attempts >= 5) {
    throw new ApiError(403, "Too many failed attempts. Try again later.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
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

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
    {
        $unset:{
            refreshToken :1
        }
    },{
        new : true
    }
    )
    const options ={
        httpOnly : true,
        secure : true 
    }

    return res
    .status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(201, {}, "User LoggedOut Successfully")
    ) 
})

const getCurrUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(404, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(404,"Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options ={
            httpOnly: true,
            secure : true 
        }

        const {accessToken , refreshToken : newrefreshToken} = 
        await generateAccessAndRefreshToken(user._id)
        
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken", newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken : newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid refresh token")
    }
})

const updateAvatar = asyncHandler(async (req, res) => {
    console.log("content-type:", req.headers["content-type"]);
    console.log("file:", req.file);


    if (!req.file) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.findById(req.user._id);

    const uploadedAvatar = await uploadOnCloudinary(req.file.path);

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
    const updatedUser = await User.findById(user._id).select(
  "-password -refreshToken"
);

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "User's avatar updated successfully")
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});
const updateUserBio = asyncHandler(async (req, res) => {
    const { bio } = req.body;
    if (!bio || bio.trim() === "") {
        throw new ApiError(400, "Bio is required");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.bio = bio;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, user, "User bio updated successfully")
    );
});

const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    await verifyOtpFromRedis("verify", user._id.toString(), otp);

    user.isVerified = true;
    await user.save();

    res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
});

const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const isCooldown = await checkCooldown("verify", user._id.toString());

    if (isCooldown) {
        throw new ApiError(400, "Please wait before requesting OTP again");
    }

    const otp = generateOTP();

    await storeOtp("verify", user._id.toString(), otp);
    await setCooldown("verify", user._id.toString());

    await sendmail(user.email, otp);

    res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully")
    );
});
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If email exists, OTP sent")
        );
    }

    const isCooldown = await checkCooldown("forgot", user._id.toString());

    if (isCooldown) {
        throw new ApiError(400, "Please wait before requesting OTP again");
    }

    const otp = generateOTP();

    await storeOtp("forgot", user._id.toString(), otp);
    await setCooldown("forgot", user._id.toString());

    await sendmail(user.email, otp);

    res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully")
    );
});
const verifyForgotOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    await verifyOtpFromRedis("forgot", user._id.toString(), otp);

    await redisClient.set(
        `reset:allowed:${user._id}`,
        "true",
        {EX: 600}
    )

    res.status(200).json(
        new ApiResponse(200, {}, "OTP verified. You may reset password.")
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const allowed = await redisClient.get(
        `reset:allowed:${user._id}`
    );

    if (!allowed) {
        throw new ApiError(403, "Password reset not authorized");
    }

    user.password = newPassword; 
    await user.save(); 

    await redisClient.del(`reset:allowed:${user._id}`);

    res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
});

export {
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
}

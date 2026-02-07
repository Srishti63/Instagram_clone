import {asyncHandler} from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { ApiError} from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {v2 as cloudinary} from "cloudinary";

const generateAccessAndRefreshToken = asyncHandler(async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
        
    } catch (err) {
        throw new ApiError(401,"Error while generating access and refresh token")
    }
})

const RegisterUser = asyncHandler(async(req ,res)=>{

    const {username, email, password} = req.body;

    if([username,email,password].some(field=>field?.trim() === "")){
        throw new ApiError(400, " All fields are required")
    };

    const existedUser = await User.findOne({
        $or : [{email}, {username}]
    });

    if(existedUser){
        throw new ApiError(400, `User with username ${username} or ${email} already exists`)
    }

    const user = await User.create({
        username : username.toLowercase(),
        email ,
        password
    });

    const createdUser = await User.findById(user._id)
    .select("-password");

    if(!createdUser){
        throw new ApiError(500 , "something went wrong while registering the user")
    };

    res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    const {username,email ,password} = req.body;

    if(!(username || email)){
        throw new ApiError(400, "Username or email is required!! ")
    }
    const user = await User.findOne({
            $or : [{username}, {email}]
        })

    if(!user){
        throw new ApiError(400 , "User doesn't exist")
    }; 

    const isPasswordValid = await User.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid Credentials")
    }

     const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

     const LoggedInuser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
        httpOnly : true,
        secure : true
     }

     res.status(200)
     .cookie("accessToken",accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
        new ApiResponse
           ( 201,
            LoggedInuser ,
            "user logged in successfully")
           )    
})

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
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

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

        const {accessToken ,newrefreshToken} = await generateAccessAndRefreshToken(user._id)
        
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

    return res.status(200).json(
        new ApiResponse(200, user, "User's avatar updated successfully")
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


export {
    RegisterUser,
    loginUser,
    logoutUser,
    getCurrUser,
    refreshAccessToken,
    updateAvatar,
    getUserProfile,
    updateUserBio
}
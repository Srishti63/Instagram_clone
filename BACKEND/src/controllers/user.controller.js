import {asyncHandler} from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { ApiError} from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const generateAccessAndRefreshToken = asyncHandler(async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = User.generateAccessToken()
        const refreshToken = User.generateRefreshToken()

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
        username : username.tolowercase(),
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

     const LoggedInuser = await user.findById(user._id).select("-password -refreshToken")

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
    await findByIdAndUpdate(
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
    .clearcookie("accessToken",options)
    .clearcookie("refreshToken",options)
    .json(
        new ApiResponse(201, {}, "User LoggedOut Successfully")
    ) 
})

export {
    RegisterUser,
    loginUser,
    logoutUser
    
}
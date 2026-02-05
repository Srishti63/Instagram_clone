import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError";

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_URL,
    api_key : process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async(localfilesPath)=>{
try {
    if(!localfilesPath) return null;
    const response = await cloudinary.uploader.upload(localfilesPath, {
        resource_type : "auto"
    })

    fs.unlinkSync(localfilesPath)
    return response

} catch (err) {
   throw new ApiError(400,"Error during uploading the media")
}
}
export { uploadOnCloudinary }


/*import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

*/
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localfilesPath) => {
  try {
    if (!localfilesPath) return null;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);

    const response = await cloudinary.uploader.upload(localfilesPath, {
      resource_type: "auto"
    });

    fs.unlinkSync(localfilesPath);
    return response;

  } catch (err) {
    console.log(err);
    throw new Error("Error during uploading the media");
  }
};

export { uploadOnCloudinary };

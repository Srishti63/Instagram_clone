import { uploadOnCloudinary } from "../utils/cloudinary";
import { Story } from "../models/story.model";
import { ApiError } from "../utils/ApiError";
import {ApiResponse} from "../utils/ApiResponse";

const postStory = asyncHandler(async(req , res)=>{
    const medialocalPath = req.files?.media?.[0]?.path;
    const {captions= ""} = req.body;

    if(!mediaUrl) {
        throw new ApiError(400,"No media found to upload")
    }

    const uploadedMedia =  await uploadOnCloudinary(medialocalPath);

    if(!uploadedMedia){
        throw new ApiError(405 , "Media Upload failed")
    }

    const story = await Story.create({
        owner : req.User._id,
        mediaUrl: uploadedMedia.secure_url,
        mediaType : uploadedMedia.resource_type,
        captions,
        expiresAt :new Date(Date.now()+ 24*60*60*1000)
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            story,
            "Story posted"
        )
    )
})

const getActiveStories = asyncHandler(async(req,res)=>{
    const activeStories = await Story.find({
        expiresAt : {$gt: new Date()}
    })

    return res.status(201).json(
        new ApiResponse(201,activeStories,"Active stories")
    )
})

const markStorySeen = asyncHandler(async(req,res)=>{
    const {storyId} = req.params;
    const viewer = req.user._id;
    
    if(!storyId){
        throw new ApiError(400,"Story ID is required")
    }

    if(storyId.tostring()==viewer.tostring()){
        res.json(
            new ApiResponse(
                200,
                {},
                "Owner is watching own story"
            )
        )
    }

    await Story.findByIdAndUpdate(
        storyId,
        {
            $addToSet:{ viewers: userId}
        },
        {
            new : true
        }
    );

    res.status(201).json(
        new ApiResponse(200,{},"Story marked as soon")
    ); 
});

const ViewersList = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  const story = await Story.findById(storyId)
    .populate("viewers", "username avatar");

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (story.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to view story viewers");
  }

  res.status(200).json(
    new ApiResponse(200, story.viewers, "Story viewers fetched")
  );
});



export {
    postStory,
    getActiveStories,
    markStorySeen,
    ViewersList
}
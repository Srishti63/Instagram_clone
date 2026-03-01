import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const toggleFollow = asyncHandler(async(req,res)=>{
    const currentUserId = req.user._id;
    const targetUserId = req.params.id;

    if(currentUserId.toString()=== targetUserId){
        throw new ApiError(400,"You can not follow youself");
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if(!targetUser){
        throw new ApiError(400,"User not found");
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if(isFollowing){
        //UNFOLLOW
        await User.findByIdAndUpdate(currentUserId,{
            $pull: {following : targetUserId}
        });

        await User.findByIdAndUpdate(targetUserId,{
            $pull : { followers: currentUserId}
        });

        return res.status(200).json(
           new ApiResponse(200, null, "User unfollowed") 
        )}
    else{
        //FOLLOW
        await User.findByIdAndUpdate(currentUserId,{
            $addToSet:{ following : targetUserId}
        });

        await User.findByIdAndUpdate(targetUserId,{
            $addToSet:{ following : currentUserId}
        });

        return res.status(200).json(
            new ApiResponse(200,null, "User Followed")
        )
    }
})

const getFollowers = asyncHandler(async(req,res)=>{
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit)|| 10;

    const user = await User.findById(userId).select("followers");

    if(!user){
        throw new ApiError(400,"User Not found");
    }
    const totalFollowers = user.followers.length;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedFollowerIds = user.followers.slice(startIndex, endIndex);

    const followers = await User.find({
        _id: { $in: paginatedFollowerIds }
    }).select("username avatar bio");

    res.status(200).json(
        new ApiResponse(200, {
        totalFollowers,
        currentPage: page,
        totalPages: Math.ceil(totalFollowers / limit),
        followers
        }, "Followers fetched successfully")
    );
})
const getFollowings = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const user = await User.findById(userId).select("following");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const totalFollowing = user.following.length;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedFollowingIds = user.following.slice(startIndex, endIndex);

  const followings = await User.find({
    _id: { $in: paginatedFollowingIds }
  }).select("username avatar bio");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalFollowing,
        currentPage: page,
        totalPages: Math.ceil(totalFollowing / limit),
        followings
      },
      "Following fetched successfully"
    )
  );
});

export {
    toggleFollow,
    getFollowers,
    getFollowings
}
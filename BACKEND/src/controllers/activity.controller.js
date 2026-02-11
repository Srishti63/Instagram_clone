import { Activity } from "../models/activity.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createActivity = async ({
  type,
  actor,
  recipient,
  post = null,
  story = null
}) => {
 
  if (actor.toString() === recipient.toString()) return;

  await Activity.create({
    type,
    actor,
    recipient,
    post,
    story
  });
};

const getUserActivities = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const activities = await Activity.find({ recipient: userId })
    .populate("actor", "username avatar")
    .populate("post", "mediaUrl mediaType")
    .populate("story", "mediaUrl")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(
    new ApiResponse(
      200,
      activities,
      "User activities fetched successfully"
    )
  );
});

const markActivitiesAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Activity.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json(
    new ApiResponse(200, {}, "Activities marked as read")
  );
});

export {
  createActivity,
  getUserActivities,
  markActivitiesAsRead
};

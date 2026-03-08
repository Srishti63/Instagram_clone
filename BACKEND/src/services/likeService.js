import notificationService from "./notificationService.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
// Assuming other models can be imported here if needed, or injected.

const modelMap = {
  POST: Post,
  COMMENT: Comment,
  // Add other models here as needed (e.g., STORY: Story)
};

export const likeContent = async ({ userId, contentOwnerId, contentId, type = "POST" }) => {
  const Model = modelMap[type.toUpperCase()];

  if (!Model) {
    throw new Error(`Invalid content type: ${type}`);
  }

  const content = await Model.findById(contentId);
  if (!content) {
    throw new Error(`${type} not found`);
  }

  let isLiked;

  if (content.likes.includes(userId)) {
    await Model.findByIdAndUpdate(
      contentId,
      { $pull: { likes: userId } }
    );
    isLiked = false;
  } else {
    await Model.findByIdAndUpdate(
      contentId,
      { $addToSet: { likes: userId } }
    );
    isLiked = true;

    if (contentOwnerId.toString() !== userId.toString()) {
      await notificationService.notify({
        type: "LIKE",
        senderId: userId,
        recipientId: contentOwnerId,
        contentId: contentId,
        contentType: type
      });
    }
  }

  return { isLiked };
};
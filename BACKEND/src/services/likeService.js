import notificationService from "./notificationService.js";
import { Post } from "../models/post.model.js";

export const likeContent = async ({ userId, contentOwnerId, contentId }) => {

  const post = await Post.findById(contentId);

  let isLiked;

  if (post.likes.includes(userId)) {

    await Post.findByIdAndUpdate(
      contentId,
      { $pull: { likes: userId } }
    );

    isLiked = false;

  } else {

    await Post.findByIdAndUpdate(
      contentId,
      { $addToSet: { likes: userId } }
    );

    isLiked = true;

    if (contentOwnerId.toString() !== userId.toString()) {

      await notificationService.notify({
        type: "LIKE",
        senderId: userId,
        recipientId: contentOwnerId,
        postId: contentId
      });

    }

  }

  return { isLiked };
};
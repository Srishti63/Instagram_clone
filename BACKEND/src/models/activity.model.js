import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "STORY_REACTION"],
      required: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story"
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);


export const Activity = mongoose.model("Activity", activitySchema);

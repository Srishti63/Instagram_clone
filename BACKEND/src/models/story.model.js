import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mediaUrl: {
      type: String,
      enum: ["Image","video"],
      required: true
    },
    caption: {
      type: String,
      default: ""
    },
    viewers: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
    ],
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { 
    timestamps: true
 }
);

export const Story = mongoose.model("Story", storySchema);

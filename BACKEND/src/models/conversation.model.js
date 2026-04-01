import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({

    participants :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    lastMessage:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Message"
    }
},{
    timestamps : true
})

conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
import mongoose, { mongo, Types } from "mongoose";

const messageSchema = new mongoose.Schema({

    conversationId:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    sender:{
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    type: String,
    lastSeen :{
        type : Boolean,
        default: false
    }

},{
    timestamps: true
})

export const Message = mongoose.model("Message",messageSchema);
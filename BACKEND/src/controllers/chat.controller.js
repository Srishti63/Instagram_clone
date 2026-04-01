import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getUserConversations = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: userId
    })
    .populate("participants", "-password")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

    return res.status(200).json(new ApiResponse(200, conversations, "Conversations fetched successfully"));

});



export const getMessages = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    const messages = await Message.find({
        conversationId
    }).sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));

});



export const createConversation = asyncHandler(async (req, res) => {

    const { receiverId } = req.body;

    if (req.user._id.toString() === receiverId.toString()) {
        return res.status(400).json({ success: false, message: "Cannot create conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [req.user._id, receiverId]
        });
    }

    return res.status(200).json(new ApiResponse(200, conversation, "Conversation created/fetched successfully"));

});
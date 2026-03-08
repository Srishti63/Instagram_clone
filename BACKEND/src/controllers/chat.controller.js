import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

export const getUserConversations = async (req, res) => {

    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: userId
    })
    .populate("participants")
    .populate("lastMessage");

    res.json(conversations);

};



export const getMessages = async (req, res) => {

    const { conversationId } = req.params;

    const messages = await Message.find({
        conversationId
    }).sort({ createdAt: 1 });

    res.json(messages);

};



export const createConversation = async (req, res) => {

    const { receiverId } = req.body;

    const conversation = await Conversation.create({
        participants: [req.user._id, receiverId]
    });

    res.json(conversation);

};
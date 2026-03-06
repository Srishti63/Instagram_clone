import express from "express";

import {
    getUserConversations,
    getMessages,
    createConversation
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/conversations", getUserConversations);

router.get("/:conversationId/messages", getMessages);

router.post("/conversation", createConversation);

export default router;
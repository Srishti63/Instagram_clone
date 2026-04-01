import express from "express";

import {
    getUserConversations,
    getMessages,
    createConversation
} from "../controllers/chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJwt);

router.get("/conversations", getUserConversations);

router.get("/:conversationId/messages", getMessages);

router.post("/conversation", createConversation);

export default router;
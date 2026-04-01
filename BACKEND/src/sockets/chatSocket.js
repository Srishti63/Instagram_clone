import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";

const onlineUsers = new Map();

export const getReceiverSocketId = (receiverId) => {
  return onlineUsers.get(receiverId);
};

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
    }

    // SEND MESSAGE
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, senderId, receiverId, text } = data;

        const message = await Message.create({
          conversationId,
          sender: senderId,
          text,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id
        });

        const receiverSocket = onlineUsers.get(receiverId);

        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", message);
        }

        socket.emit("receive_message", message);
      } catch (error) {
        console.error("Message error:", error);
      }
    });
    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (let [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
          break;
        }
      }
    });
  });
};

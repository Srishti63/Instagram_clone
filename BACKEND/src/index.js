import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import { connectRedis } from "./utils/redisClient.js";
import { app } from "./app.js";

import notificationService from "./services/notificationService.js";
import InAppNotificationObserver from "./observers/inAppNotificationObserver.js";
import { initChatSocket } from "./sockets/chatSocket.js";

import http from "http";
import { Server } from "socket.io";

await connectRedis();

const inAppObserver = new InAppNotificationObserver();
notificationService.subscribe(inAppObserver);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
initChatSocket(io);

// Expose io locally for other parts of the app if needed, 
// though we usually pass io to where it's needed or export it.
export { io };

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 8000;

    // Remove the duplicate server.listen(5000) that existed previously
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("Startup failed:", error);
  }
};

startServer();
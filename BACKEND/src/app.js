import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import commentRouter from "./routes/comment.route.js";
import storyRouter from "./routes/story.route.js";
import activityRouter from "./routes/activity.route.js";
import chatRouter from "./routes/chat.route.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/stories", storyRouter);
app.use("/api/v1/activities", activityRouter);
app.use("/api/v1/chat", chatRouter);


// Global Error Handler
app.use((err, req, res, next) => {
    // If headers have already been sent to the client, delegate to the default Express error handler
    if (res.headersSent) {
      return next(err);
    }
    
    // Check if error is out custom ApiError
    const statusCode = err.statuscode || err.statusCode || 500;
    const message = err.message || "Something went wrong";
    
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };

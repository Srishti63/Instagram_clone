import mongoose from "mongoose";
import { Post } from "./src/models/post.model.js";

const checkPosts = async () => {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/instaclone"); 
  const posts = await Post.find().limit(5);
  console.log(JSON.stringify(posts, null, 2));
  process.exit(0);
};

checkPosts();

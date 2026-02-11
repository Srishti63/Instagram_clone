import mongoose from "mongoose";

const postSchema  = new mongoose.Schema(
    {
        userId: {
            type : mongoose.Schema.ObjectId,
            ref : "User",
            required : true
        },
        mediaUrl: {
            type : String ,
            required : true 
        },
        caption: {
            type : String ,
            default : ""
        },
        likes :{
            type: mongoose.Schema.ObjectId,
            ref : "User"
        }
    },{
        timestamps : true 
    }
);

export const Post = mongoose.model("Post", postSchema)


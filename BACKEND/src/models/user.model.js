import mongoose,{ Schema } from "mongoose";
import bcyrpt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username :{
            type : String ,
            required : true ,
            unique : true,
            lowerCase : true,
            trim : true
        },
        email :{
            type: String ,
            required : true ,
            lowercase : true ,
            unique : true
        },
        password:{
            type : String ,
            required : true
        },
        bio:{
            type : String ,
            default : ""
        },
        avatar: {
        url: {
            type: String,
            default: ""
        },
        public_id: {
            type: String,
            default: ""
        }
    },
        followers:{
            type : mongoose.Schema.ObjectId,
            ref : "User"
        },
        following: {
            type : mongoose.Schema.ObjectId,
            ref : "User"
        },
        settings :{
            isPrivate : {
                type : boolean,
                default: false
            },
            Notification:{
                type : boolean,
                default : true 
            },
            showActivityStatus : {
                type : boolean ,
                default : true 
            }
        }
},{
    timestamps : true 
});

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next(),

    this.password = await bcyrpt.hash(this.password,10),
    next()
})
 
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcyrpt.compare(password,this.password)
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            username :this.username,
            email : this.email,
        },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }
    )
}
userSchema.methods.refreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn : process.env.REFRESH_TOKEN_EXPIRY
            }
    )
}


export const User = mongoose.model("User" , userSchema)
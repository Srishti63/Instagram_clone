import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcrypt";
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
        emailOtp :String,
        emailOtpExpiry : Date,
        isVerified :{
            type : Boolean,
            default : false
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
    refreshToken :{
        type: String
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
                type : Boolean,
                default: false
            },
            Notification:{
                type : Boolean,
                default : true 
            },
            showActivityStatus : {
                type : Boolean ,
                default : true 
            }
        }
},{
    timestamps : true 
});

userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return ;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
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
userSchema.methods.generateRefreshToken = function(){
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
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const  sendmail = async(to ,otp)=>{
    console.log("USER:", process.env.EMAIL_USER);
    console.log("PASS:", process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth :{
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification OTP",
    html: `<h2>Your OTP is: ${otp}</h2>
           <p>This OTP expires in 5 minutes.</p>`
    })
};
import nodemailer from "nodemailer";

export const  sendmail = async(to ,otp)=>{
    const transporter = nodemailer.createTransport({
        service :"gmail",
        auth :{
            user : process.env.email_user,
            pass : process.env.email_pass
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
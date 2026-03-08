import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendOtpEmail(to, otp) {
        return this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: "Email Verification OTP",
            html: `<h2>Your OTP is: ${otp}</h2>
                   <p>This OTP expires in 5 minutes.</p>`
        });
    }

    // Additional email methods can be added here (OCP)
}

export default new EmailService(); // Exporting an instance for simpler DI/usage

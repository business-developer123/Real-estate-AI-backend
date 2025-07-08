import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// This utility is used to send emails
export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
} as any);
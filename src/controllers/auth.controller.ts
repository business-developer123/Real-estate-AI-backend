import { RequestHandler } from 'express';
import dotenv from 'dotenv';
import { resetPasswordService, resendVerificationEmailService, signinService, signupService, verifyEmailService, resetPasswordWithTokenService    } from "../services/auth.service";

dotenv.config();

// This controller is used to sign up a new user
export const signup: RequestHandler = async (req, res) => {
    const { fullname, email, phone, password } = req.body;
    const data = await signupService(fullname, email, phone, password);
    res.status(200).json(data);
};

// This controller is used to sign in a user
export const signin: RequestHandler = async (req, res) => {
    const { email, password } = req.body;
    const data = await signinService(email, password);
    res.status(200).json(data);
};

// This controller is used to verify a user's email
export const verifyEmail: RequestHandler = async (req, res) => {
    const { token } = req.query;
    const data = await verifyEmailService(token as string);
    res.status(200).json(data);
};

// This controller is used to reset a user's password
export const resetPassword: RequestHandler = async (req, res) => {
    const { email } = req.body;
    const data = await resetPasswordService(email);
    res.status(200).json(data);
};

// This controller is used to resend a verification email to a user
export const resendVerificationEmail: RequestHandler = async (req, res) => {
    const { email } = req.body;
    const data = await resendVerificationEmailService(email);
    res.status(200).json(data);
};

// This controller is used to reset a user's password with a token
export const resetPasswordWithToken: RequestHandler = async (req, res) => {
    const { token, password } = req.query;
    const data = await resetPasswordWithTokenService(token as string, password as string);
    res.status(200).json(data);
};
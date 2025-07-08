import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase';
import { PASSWORD_RESET_SUCCESS_TEMPLATE,   VERIFICATION_EMAIL_TEMPLATE } from '../utils/email.temp';
import { transporter } from '../utils/transporter';

// This service is used to sign up a new user
export const signupService = async (fullname: string, email: string, phone: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: userData, error: userError } = await supabase.from('users').select('*').eq('email', email);
    if (userData && userData.length > 0) {
        return { message: 'Email already exists', status: false };
    }
    if (userError) {
        return { message: userError.message, status: false };
    }
    const { data, error } = await supabase.from('users').insert({ fullname, email, phone, password: hashedPassword }).select();
    if (error) {
        return { message: error.message, status: false };
    }
    const token = jwt.sign({ data }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationURL}', `${process.env.FRONTEND_URL}/api/v1/auth/verify?token=${token}`),
    };

    try {
        await transporter.sendMail(mailOptions);
        return { message: 'User registered successfully. Please check your email for verification.', token, verifyEmail: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { message: 'User registered successfully. Email verification may be delayed.', token, verifyEmail: false };
    }
}

// This service is used to sign in a user
export const signinService = async (email: string, password: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email);
    if (data && data.length > 0 && !data[0].is_verified) {
        return { message: 'Email not verified', status: false };
    }
    if (error) {
        return { message: error.message, status: false };
    }
    if (data && data.length > 0 && await bcrypt.compare(password, data[0].password)) {
        let token = jwt.sign({ data }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        return { message: 'User signed in successfully', token };
    }
    return { message: 'Invalid email or password', status: false };
}

// This service is used to verify a user's email
export const verifyEmailService = async (token: string) => {
    try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as any;
        const { data, error } = await supabase.from('users').update({ is_verified: true }).eq('email', decoded.data[0].email).select();
        if (error) {
            return { status: false, message: error.message };
        }
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { status: false, message: 'Verification link has expired. Please request a new verification email.', error: 'TOKEN_EXPIRED' };
        } else if (error instanceof jwt.JsonWebTokenError) {
            return { status: false, message: 'Invalid verification link.', error: 'INVALID_TOKEN' };
        } else {
            return { status: false, message: 'An error occurred during email verification.', error: 'VERIFICATION_ERROR' };
        }
    }
}

// This service is used to reset a user's password
export const resetPasswordService = async (email: string) => {
    const { data } = await supabase.from('users').select('*').eq('email', email);
    if (data && data.length > 0) {
        const token = jwt.sign({ data }, process.env.JWT_SECRET!, { expiresIn: '24h' });

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Reset your password',
                html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{resetURL}', `${process.env.FRONTEND_URL}/api/v1/auth/reset-password?token=${token}`),
            };
            await transporter.sendMail(mailOptions);
            return { status: true, message: 'Password reset email sent successfully', token, verifyEmail: true };
        } catch (error) {
            console.error('Email sending failed:', error);
            return {
                status: true,
                message: 'Password reset initiated. Email may be delayed.',
                token,
                verifyEmail: false
            };
        }
    } else {
        return { status: true, message: 'Email not found' };
    }
}

// This service is used to resend a verification email to a user
export const resendVerificationEmailService = async (email: string) => {
    try {
        const { data, error } = await supabase.from('users').select('*').eq('email', email);
        
        if (error) {
            return { status: false, message: error.message };
        }
        
        if (!data || data.length === 0) {
            return { status: false, message: 'User not found' };
        }
        
        if (data[0].is_verified) {
            return { status: true, message: 'Email is already verified' };
        }
        
        const token = jwt.sign({ data }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationURL}', `${process.env.FRONTEND_URL}/api/v1/auth/verify?token=${token}`),
        };
        
        await transporter.sendMail(mailOptions);
        return { 
            status: true, 
            message: 'Verification email sent successfully. Please check your inbox.',
            token 
        };
        
    } catch (error) {
        console.error('Email sending failed:', error);
        return { 
            status: false, 
            message: 'Failed to send verification email. Please try again later.' 
        };
    }
}

// This service is used to reset a user's password with a token
export const resetPasswordWithTokenService = async (token: string, password: string) => {
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { data: { email: string } };
    const hashedPassword = await bcrypt.hash(password as string, 10);
    const { data, error } = await supabase.from('users').update({ password: hashedPassword }).eq('email', decoded.data.email).select();
    if (error) {
        return { status: false, message: 'Invalid token' };
    }
    return { status: true, message: 'Password reset successfully', data };
}
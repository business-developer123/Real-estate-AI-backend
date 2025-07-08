import { Router } from 'express';
import { signup, signin, verifyEmail, resetPassword, resetPasswordWithToken, getUser, updateUser, uploadImage, resendResetPasswordEmail, resendVerificationEmail } from '../controllers/auth.controller';
import {
    signupValidation,
    signinValidation,
    verifyEmailValidation,
    resetPasswordValidation,
    resetPasswordWithTokenValidation,
    updateUserValidation
} from '../validation/auth.validation';
import { userMiddleware, uploadMiddleware } from '../middleware';

const router = Router();

// Auth Routes
router.post('/signup', signupValidation, signup); // Sign up a new user
router.post('/signin', signinValidation, signin); // Sign in a user
router.get('/verify', verifyEmailValidation, verifyEmail); // Verify a user's email
router.post('/reset-password', resetPasswordValidation, resetPassword); // Reset a user's password
router.get('/reset-password', resetPasswordWithTokenValidation, resetPasswordWithToken); // Reset a user's password with a token
router.post('/resend-reset-password-email', resendResetPasswordEmail); // Resend a reset password email
router.post('/resend-verification-email', resendVerificationEmail); // Resend a verification email

// User Routes
router.get('/user', getUser); // Get a user's profile
router.put('/user', userMiddleware, updateUserValidation, updateUser); // Update a user's profile
router.post('/user/upload', userMiddleware, uploadMiddleware, uploadImage); // Upload a user's image
router.put('/user/change-password', resetPasswordValidation, resetPassword); // Change a user's password

export default router;
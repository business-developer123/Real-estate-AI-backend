import { Router } from 'express';
import { signup, signin, verifyEmail, resetPassword, resetPasswordWithToken } from '../controllers';
import { signupValidation, signinValidation, verifyEmailValidation, resetPasswordValidation, resetPasswordWithTokenValidation } from '../validation/auth.validation';

const router = Router();

// Auth Routes
router.post('/signup', signupValidation, signup); // Sign up a new user
router.post('/signin', signinValidation, signin); // Sign in a user
router.get('/verify', verifyEmailValidation, verifyEmail); // Verify a user's email
router.post('/reset-password', resetPasswordValidation, resetPassword); // Reset a user's password
router.get('/reset-password', resetPasswordWithTokenValidation, resetPasswordWithToken); // Reset a user's password with a token

export default router;
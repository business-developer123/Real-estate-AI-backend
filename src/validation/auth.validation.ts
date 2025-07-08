import { check } from 'express-validator';

// This validation is used to sign up a new user``
export const signupValidation = [
    check('fullname').notEmpty().withMessage('Fullname is required'),
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    check('phone').notEmpty().withMessage('Phone is required'),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// This validation is used to sign in a user
export const signinValidation = [
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// This validation is used to verify a user's email
export const verifyEmailValidation = [
    check('token').notEmpty().withMessage('Token is required'),
];

// This validation is used to reset a user's password
export const resetPasswordValidation = [
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
];

// This validation is used to reset a user's password with a token
export const resetPasswordWithTokenValidation = [
    check('token').notEmpty().withMessage('Token is required'),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// This validation is used to update a user's profile
export const updateUserValidation = [
    check('fullname').notEmpty().withMessage('Fullname is required'),
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
    check('phone').notEmpty().withMessage('Phone is required'),
];
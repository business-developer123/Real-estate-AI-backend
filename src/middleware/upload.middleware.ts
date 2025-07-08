import multer from "multer";
import { NextFunction, Request, Response } from "express";

// Use memory storage so files are not saved to disk
const storage = multer.memoryStorage();

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const upload = multer({ storage });
    upload.single('image')(req, res, (err: any) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}
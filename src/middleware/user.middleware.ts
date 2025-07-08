import { NextFunction, Response } from "express";
import { getUserService } from "../services/auth.service";

// Extend Express Request type to include 'user'
import { Request } from "express-serve-static-core";

interface AuthenticatedRequest extends Request {
    user?: any;
}

// This middleware is used to get a user's profile
export const userMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({ message: "Authorization token missing" });
        }
        const data = await getUserService(token as string);
        if (data.status) {
            req.user = data.data;
            return next();
        } else {
            res.status(401).json({ message: data.message });
        }
    } catch (err: any) {
        res.status(401).json({ message: err.message || "Unauthorized" });
    }
};
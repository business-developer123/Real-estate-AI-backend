import multer from "multer";
// Use memory storage so files are not saved to disk
const storage = multer.memoryStorage();

export const upload = multer({ storage });

// For backward compatibility, keep the old middleware for 'image' field
export const uploadImageMiddleware = upload.single('image');
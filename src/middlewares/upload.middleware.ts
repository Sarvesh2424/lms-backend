import multer from "multer";

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Max 5MB upload validation window
});

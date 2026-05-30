import { Router } from "express";
import { uploadImageController } from "../controllers/upload.controller";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/upload-image",
  uploadMiddleware.single("image"),
  uploadImageController,
);

export default router;

import { Router } from "express";
import {
  createLearningPathController,
} from "../controllers/learningPath.controller";
import { validate } from "../middlewares/validate.middleware";
import { LearningPathZodSchema } from "../schemas/learningPath.schema";

const router = Router();

router.post(
  "/create-learningPath",
  validate(LearningPathZodSchema),
  createLearningPathController,
);

export default router;

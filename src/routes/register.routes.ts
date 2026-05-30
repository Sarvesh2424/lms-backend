import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { LearnerProfileZodSchema } from "../schemas/learner.schema";
import {
  registerInstructorController,
  registerLearnerController,
} from "../controllers/register.controller";

const router = Router();

router.post(
  "/learner-register",
  validate(LearnerProfileZodSchema),
  registerLearnerController,
);
router.post("/instructor-register", registerInstructorController);

export default router;

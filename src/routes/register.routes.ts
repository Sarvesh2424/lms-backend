import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { LearnerProfileZodSchema } from "../schemas/learner.schema";
import {
  registerInstructorController,
  registerLearnerController,
} from "../controllers/register.controller";
import { InstructorLoginZodSchema } from "../schemas/instructor.schema";

const router = Router();

router.post(
  "/learner-register",
  validate(LearnerProfileZodSchema),
  registerLearnerController,
);
router.post(
  "/instructor-register",
  validate(InstructorLoginZodSchema),
  registerInstructorController,
);

export default router;

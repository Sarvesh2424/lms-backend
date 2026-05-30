import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getLearnerProfileController } from "../controllers/learner.controller";
import { validate } from "../middlewares/validate.middleware";
import { CommunityPostZodSchema } from "../schemas/communityPost.schema";
import {
  createPostController,
  getPostsController,
} from "../controllers/communityPost.controller";
import { CourseZodSchema } from "../schemas/course.schema";
import { createCourseController } from "../controllers/instructor.controller";

const router = Router();

router.post(
  "/create-course",
  validate(CourseZodSchema),
  // authMiddleware("learner_token"),
  createCourseController,
);

export default router;

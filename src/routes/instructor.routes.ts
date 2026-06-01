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
import {
  createAssignmentController,
  createCourseController,
} from "../controllers/instructor.controller";
import { AssignmentZodSchema } from "../schemas/assignment.schema";

const router = Router();

router.post(
  "/create-course",
  validate(CourseZodSchema),
  // authMiddleware("learner_token"),
  createCourseController,
);

router.post(
  "/create-assignment",
  validate(AssignmentZodSchema),
  createAssignmentController,
);

export default router;

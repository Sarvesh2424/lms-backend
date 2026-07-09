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
  getInstructorProfileController,
} from "../controllers/instructor.controller";
import { AssignmentZodSchema } from "../schemas/assignment.schema";
import { getInstructorSessionController } from "../controllers/session.controller";

const router = Router();

router.get(
  "/me",
  authMiddleware("instructor_token"),
  getInstructorSessionController,
);

router.get(
  "/get-profile",
  authMiddleware("instructor_token"),
  getInstructorProfileController,
);

router.post(
  "/create-assignment",
  validate(AssignmentZodSchema),
  createAssignmentController,
);

export default router;

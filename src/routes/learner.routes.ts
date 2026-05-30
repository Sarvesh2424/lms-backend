import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getCourseByIdController,
  getCoursesController,
  getLearnerProfileController,
} from "../controllers/learner.controller";
import { validate } from "../middlewares/validate.middleware";
import { CommunityPostZodSchema } from "../schemas/communityPost.schema";
import {
  createPostController,
  getPostsController,
} from "../controllers/communityPost.controller";

const router = Router();

router.get(
  "/get-profile",
  authMiddleware("learner_token"),
  getLearnerProfileController,
);

router.post(
  "/create-post",
  validate(CommunityPostZodSchema),
  // authMiddleware("learner_token"),
  createPostController,
);
router.get("/get-posts", authMiddleware("learner_token"), getPostsController);

router.get(
  "/get-courses",
  authMiddleware("learner_token"),
  getCoursesController,
);

router.get(
  "/get-course/:courseId",
  authMiddleware("learner_token"),
  getCourseByIdController,
);

export default router;

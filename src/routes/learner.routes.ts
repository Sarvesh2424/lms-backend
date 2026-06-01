import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createBookmarkController,
  getAssignmentsController,
  getBookmarksController,
  getCourseByIdController,
  getCoursesController,
  getLearnerProfileController,
  getLearningPathByIdController,
  getLearningPathsController,
} from "../controllers/learner.controller";
import { validate } from "../middlewares/validate.middleware";
import { CommunityPostZodSchema } from "../schemas/communityPost.schema";
import {
  createPostController,
  getPostsController,
} from "../controllers/communityPost.controller";
import { BookmarkZodSchema } from "../schemas/bookmark.schema";

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

router.get(
  "/get-learningPaths",
  authMiddleware("learner_token"),
  getLearningPathsController,
);
router.get(
  "/get-learningPath/:learningPathId",
  authMiddleware("learner_token"),
  getLearningPathByIdController,
);

router.get(
  "/get-assignments",
  authMiddleware("learner_token"),
  getAssignmentsController,
);

router.post(
  "/create-bookmark",
  validate(BookmarkZodSchema),
  // authMiddleware("learner_token"),
  createBookmarkController,
);
router.get(
  "/get-bookmarks",
  authMiddleware("learner_token"),
  getBookmarksController,
);
export default router;

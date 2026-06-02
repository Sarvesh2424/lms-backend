import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createBookmarkController,
  createGoalController,
  createTodoController,
  createWorkspaceNoteController,
  getAssignmentsController,
  getBookmarksController,
  getCourseByIdController,
  getCoursesController,
  getGoalsController,
  getLearnerProfileController,
  getLearningPathByIdController,
  getLearningPathsController,
  getTodosController,
  getWorkspaceNotesController,
  updateTodoController,
} from "../controllers/learner.controller";
import { validate } from "../middlewares/validate.middleware";
import { CommunityPostZodSchema } from "../schemas/communityPost.schema";
import {
  createPostController,
  getPostsController,
} from "../controllers/communityPost.controller";
import { BookmarkZodSchema } from "../schemas/bookmark.schema";
import { WorkspaceNoteZodSchema } from "../schemas/workspaceNote.schema";
import { TodoZodSchema } from "../schemas/todo.schema";
import { GoalZodSchema } from "../schemas/goal.schema";

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

router.post(
  "/create-workspaceNote",
  validate(WorkspaceNoteZodSchema),
  createWorkspaceNoteController,
);
router.get(
  "/get-workspaceNotes",
  authMiddleware("learner_token"),
  getWorkspaceNotesController,
);

router.post("/create-todo", validate(TodoZodSchema), createTodoController);
router.get("/get-todos", authMiddleware("learner_token"), getTodosController);
router.patch("/update-todo/:id", updateTodoController);

router.post("/create-goal", validate(GoalZodSchema), createGoalController);
router.get("/get-goals", authMiddleware("learner_token"), getGoalsController);
export default router;

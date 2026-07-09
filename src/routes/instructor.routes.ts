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
  changeEmailController,
  changePasswordController,
  createAssignmentController,
  deleteAccountController,
  getInstructorProfileController,
  getSessionsController,
  logoutController,
  revokeSessionController,
  toggleTwoFactorController,
  updatePreferencesController,
  updateProfileHandler,
} from "../controllers/instructor.controller";
import { AssignmentZodSchema } from "../schemas/assignment.schema";
import { getInstructorSessionController } from "../controllers/session.controller";
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  toggleTwoFactorSchema,
  updateInstructorProfileSchema,
  updatePreferencesSchema,
} from "../schemas/instructor.schema";

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

router.patch(
  "/update-profile",
  authMiddleware("instructor_token"),
  validate(updateInstructorProfileSchema),
  updateProfileHandler,
);
router.patch(
  "/change-email",
  authMiddleware("instructor_token"),
  validate(changeEmailSchema),
  changeEmailController,
);
router.patch(
  "/change-password",
  authMiddleware("instructor_token"),
  validate(changePasswordSchema),
  changePasswordController,
);
router.patch(
  "/preferences",
  authMiddleware("instructor_token"),
  validate(updatePreferencesSchema),
  updatePreferencesController,
);
router.patch(
  "/two-factor",
  authMiddleware("instructor_token"),
  validate(toggleTwoFactorSchema),
  toggleTwoFactorController,
);
router.get(
  "/sessions",
  authMiddleware("instructor_token"),
  getSessionsController,
);
router.delete(
  "/sessions/:sessionId",
  authMiddleware("instructor_token"),
  revokeSessionController,
);
router.post("/logout", authMiddleware("instructor_token"), logoutController);
router.delete(
  "/delete-account",
  authMiddleware("instructor_token"),
  validate(deleteAccountSchema),
  deleteAccountController,
);

export default router;

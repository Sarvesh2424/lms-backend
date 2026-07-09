import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateCourseZodSchema,
  ScheduleCourseZodSchema,
  UpdateCourseZodSchema,
} from "../schemas/course.schema";
import * as courseController from "../controllers/course.controller";

const router = Router();

router.post(
  "/",
  authMiddleware("instructor_token"),
  validate(CreateCourseZodSchema),
  courseController.createCourseController,
);

router.patch(
  "/:id",
  authMiddleware("instructor_token"),
  validate(UpdateCourseZodSchema),
  courseController.updateCourseController,
);

router.post(
  "/:id/submit-for-review",
  authMiddleware("instructor_token"),
  courseController.submitForReviewController,
);
router.post(
  "/:id/publish",
  authMiddleware("instructor_token"),
  courseController.publishCourseController,
);
router.post(
  "/:id/schedule",
  authMiddleware("instructor_token"),
  validate(ScheduleCourseZodSchema),
  courseController.scheduleCourseController,
);
router.post(
  "/:id/cancel-schedule",
  authMiddleware("instructor_token"),
  courseController.cancelScheduleController,
);
router.post(
  "/:id/archive",
  authMiddleware("instructor_token"),
  courseController.archiveCourseController,
);
router.post(
  "/:id/restore",
  authMiddleware("instructor_token"),
  courseController.restoreCourseController,
);
router.delete(
  "/:id",
  authMiddleware("instructor_token"),
  courseController.deleteCourseController,
);

router.get(
  "/mine",
  authMiddleware("instructor_token"),
  courseController.listCoursesController,
);
router.get(
  "/:id",
  authMiddleware("instructor_token"),
  courseController.getCourseController,
);

// TODO: these two need a reviewer/admin auth middleware, not instructor_token -
// wire up once an admin role exists.
// router.post("/:id/approve", authMiddleware("admin_token"), courseController.approveCourseController);
// router.post("/:id/reject", authMiddleware("admin_token"), validate(RejectCourseZodSchema), courseController.rejectCourseController);

export default router;

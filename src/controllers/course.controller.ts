import { StatusCodes } from "../common/errors/statusCodes";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import * as courseService from "../services/course.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.createCourse(
      (req.user as any)._id || (req.user as any).id,
      req.body,
    );
    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Course created successfully",
      course,
    });
  },
);

export const updateCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.updateCourse(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
      req.body,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course updated successfully",
      course,
    });
  },
);

export const submitForReviewController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.submitCourseForReview(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course submitted for review",
      course,
    });
  },
);

export const publishCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.publishCourse(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course published successfully",
      course,
    });
  },
);

export const scheduleCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.schedulePublish(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
      req.body.scheduledPublishAt,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course publish scheduled",
      course,
    });
  },
);

export const cancelScheduleController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.cancelSchedule(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Scheduled publish cancelled",
      course,
    });
  },
);

export const archiveCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.archiveCourse(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course archived",
      course,
    });
  },
);

export const restoreCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.restoreCourse(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course restored to draft",
      course,
    });
  },
);

export const deleteCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    await courseService.deleteCourse(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course deleted successfully",
    });
  },
);

export const getCourseController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const course = await courseService.getCourseById(
      req.params.id,
      (req.user as any)._id || (req.user as any).id,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Course fetched successfully",
      course,
    });
  },
);

export const listCoursesController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { search, status, sort } = req.query as Record<string, string>;
    const courses = await courseService.getInstructorCourses(
      (req.user as any)._id || (req.user as any).id,
      { search, status, sort },
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Courses fetched successfully",
      courses,
    });
  },
);

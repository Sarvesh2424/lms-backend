import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import {
  bookmarkService,
  getCourseById,
  getCourses,
  getLearnerProfile,
} from "../services/learner.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { learningPathService } from "../services/learningPath.service";
import { assignmentService } from "../services/assignment.service";

export const getLearnerProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = (req as any).user.id;
    const learner = await getLearnerProfile(id);
    returnSuccessResponse(res, StatusCodes.OK, learner);
  },
);

export const getCoursesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const filters = req.query;
    const learnerData = req.user;
    const courses = await getCourses(filters, learnerData);

    returnSuccessResponse(res, StatusCodes.OK, courses);
  },
);

export const getCourseByIdController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { courseId } = req.params;
    const learnerData = req.user;

    const course = await getCourseById(courseId, learnerData);

    if (!course) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Course not found",
      });
    }

    returnSuccessResponse(res, StatusCodes.OK, course);
  },
);

export const getLearningPathsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const paths = await learningPathService.getAll(user);

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Learning paths retrieved successfully",
      learningPaths: paths,
    });
  },
);

export const getLearningPathByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const path = await learningPathService.getById(id);

    if (!path) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `Learning path framework with reference ID [${id}] could not be found.`,
      });
      return;
    }

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Learning path details retrieved successfully",
      learningPath: path,
    });
  },
);

export const getAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const assignments = await assignmentService.getAll();

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Assignments retrieved successfully",
      assignments,
    });
  },
);

export const createBookmarkController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newBookmark = await bookmarkService.create(validatedData);

    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Bookmark saved successfully",
      bookmark: {
        id: newBookmark._id, // Normalize standard database reference key
        ...newBookmark,
      },
    });
  },
);

export const getBookmarksController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const bookmarks = await bookmarkService.getAll(user);

    return returnSuccessResponse(res, StatusCodes.OK, {
      message: "Bookmarks directory compiled successfully",
      bookmarks,
    });
  },
);

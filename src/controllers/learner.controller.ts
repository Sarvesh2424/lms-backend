import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import {
  getCourseById,
  getCourses,
  getLearnerProfile,
} from "../services/learner.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

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

    console.log(learnerData);
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

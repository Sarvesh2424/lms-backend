import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Learner } from "../models/Learner.model";
import { Instructor } from "../models/Instructor.model";

export const getLearnerSessionController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const tokenUser = req.user as any;
    const learnerId = tokenUser._id || tokenUser.id;

    const learner = await Learner.findById(learnerId)
      .select("name email")
      .lean();
    if (!learner) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Session is no longer valid",
      });
    }

    returnSuccessResponse(res, StatusCodes.OK, {
      user: {
        id: learner._id,
        email: learner.email,
        name: learner.name,
        roles: ["Learner"],
      },
    });
  },
);

export const getInstructorSessionController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const tokenUser = req.user as any;
    const instructorId = tokenUser._id || tokenUser.id;

    const instructor = await Instructor.findById(instructorId)
      .select("name email avatarUrl")
      .lean();

    if (!instructor) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Session is no longer valid",
      });
    }

    returnSuccessResponse(res, StatusCodes.OK, {
      user: {
        id: instructor._id,
        email: instructor.email,
        name: instructor.name,
         ...(instructor.avatarUrl ? { avatarUrl: instructor.avatarUrl } : {}),
        roles: ["Instructor"],
      },
    });
  },
);

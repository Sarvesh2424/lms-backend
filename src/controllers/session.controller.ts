import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Learner } from "../models/Learner.model";

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
    const u = req.user as any;
    returnSuccessResponse(res, StatusCodes.OK, {
      user: {
        id: u._id || u.id,
        email: u.email,
        name: u.name,
        roles: ["Instructor"],
      },
    });
  },
);

import { Request, Response } from "express";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "../common/errors/statusCodes";
import {
  assignmentService,
  createCourse,
  getInstructorProfile,
} from "../services/instructor.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getInstructorProfileController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const profile = await getInstructorProfile(instructorId);
    returnSuccessResponse(res, StatusCodes.OK, profile);
  },
);

export const createAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newAssignment = await assignmentService.create(validatedData);

    // Dispatch uniform success response with your standard envelope structure
    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Assignment created successfully",
      assignment: {
        id: newAssignment._id, // Normalize the database identifier handle
        ...newAssignment,
      },
    });
  },
);

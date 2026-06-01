import { Request, Response } from "express";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "../common/errors/statusCodes";
import {
  assignmentService,
  createCourse,
} from "../services/instructor.service";

export const createCourseController = asyncHandler(
  async (req: Request, res: Response) => {
    const newCourse = await createCourse(req.body);

    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Course created successfully",
      course: newCourse,
    });
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

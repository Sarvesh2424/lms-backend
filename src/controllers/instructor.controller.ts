import { Request, Response } from "express";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "../common/errors/statusCodes";
import { createCourse } from "../services/instructor.service";

export const createCourseController = asyncHandler(
  async (req: Request, res: Response) => {
    const newCourse = await createCourse(req.body);


    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Course created successfully",
      course: newCourse,
    });
  }
);
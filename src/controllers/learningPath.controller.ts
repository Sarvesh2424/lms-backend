import { Request, Response, NextFunction } from "express";
import { learningPathService } from "../services/learningPath.service";
import { StatusCodes } from "../common/errors/statusCodes";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";

export const createLearningPathController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = req.body;

    // Business Logic Guardrail: Prevent duplicate titles
    const titleExists = await learningPathService.existsByTitle(data.title);
    if (titleExists) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: `A curriculum framework titled "${data.title}" already exists.`,
      });
      return;
    }

    const createdPath = await learningPathService.create(data);

    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Learning path created successfully",
      learningPath: {
        id: createdPath._id,
        ...createdPath,
      },
    });
  }
);
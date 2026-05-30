import { Request, Response } from "express";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { uploadAndCompressImage } from "../services/upload.service";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";

export const uploadImageController = asyncHandler(
  async (req: Request, res: Response) => {
    // Check if the Multer parsing engine populated the file interceptor object
    if (!req.file) {
      throw new AppError(
        "No file detected. Please attach an image under the 'image' field key.",
        StatusCodes.BAD_REQUEST,
      );
    }

    const uploadResult = await uploadAndCompressImage(req.file);

    returnSuccessResponse(res, StatusCodes.CREATED, uploadResult);
  },
);

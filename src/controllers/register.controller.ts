import { Request, Response } from "express";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "../common/errors/statusCodes";
import { registerInstructor, registerLearner } from "../services/register.service";

export const registerLearnerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    const newLearner = await registerLearner({
      email,
      name,
      password,
      title: "",
      stats: [],
    });

    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Registration successful",
      data: newLearner,
    });
  },
);

export const registerInstructorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, name, password } = req.body;

    const newInstructor = await registerInstructor({
      email,
      name,
      password,
      title: "",
      stats: [],
    });

    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Registration successful",
      data: newInstructor,
    });
  },
);

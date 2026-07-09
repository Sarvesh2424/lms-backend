import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import { loginInstructor, loginLearner } from "../services/login.service";

export const loginLearnerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, learner } = await loginLearner({ email, password });

    res.cookie("learner_token", token, {
      httpOnly: true,
      secure: true, // true in prod (https), false locally
      sameSite: "none",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });
    returnSuccessResponse(res, StatusCodes.OK, {
      user: {
        id: learner._id || "u_fallback",
        email: email,
        name: learner.name, // Fallback name calculation
        roles: ["Learner"],
      },
      accessToken: token,
      expiresAt: Date.now() + 1 * 24 * 60 * 60 * 1000,
    });
  },
);

export const loginInstructorController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, instructor } = await loginInstructor({ email, password });

    res.cookie("instructor_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    returnSuccessResponse(res, StatusCodes.OK, {
      user: {
        id: instructor._id,
        email: instructor.email,
        name: instructor.name,
        roles: ["Instructor"],
      },
      accessToken: token,
      expiresAt: Date.now() + 1 * 24 * 60 * 60 * 1000,
    });
  },
);

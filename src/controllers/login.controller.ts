import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";
import { loginLearner } from "../services/login.service";

export const loginLearnerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { token, learner } = await loginLearner({ email, password });

    res.cookie("learner_token", token, {
      httpOnly: true,
      secure: false, // true in prod (https), false locally
      sameSite: "lax",
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

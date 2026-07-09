import { Request, Response } from "express";
import { returnSuccessResponse } from "../utils/apiout";
import { StatusCodes } from "../common/errors/statusCodes";

export const logoutLearnerController = (req: Request, res: Response) => {
  res.clearCookie("learner_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

export const logoutInstructorController = (req: Request, res: Response) => {
  res.clearCookie("instructor_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  returnSuccessResponse(res, StatusCodes.OK, {
    message: "Logged out successfully",
  });
};

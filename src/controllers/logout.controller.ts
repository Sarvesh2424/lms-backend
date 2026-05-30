import { Request, Response } from "express";

export const logoutLearnerController = (req: Request, res: Response) => {
  res.clearCookie("learner_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/", 
  });

  return res.status(200).json({ success: true, message: "Logged out successfully" });
};
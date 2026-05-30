import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { Learner } from "../models/Learner.model";
import { LoginPayload } from "../types/LoginPayload.type";
import { env } from "../config/env";

export const loginLearner = async ({ email, password }: LoginPayload) => {
  // Find the learner by email
  const learner = await Learner.findOne({ email: email.toLowerCase() });

  if (!learner) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  // Verify the plain-text password against the hashed password in DB
  if (!password) {
    throw new AppError("Password is required", StatusCodes.BAD_REQUEST);
  }

  const isPasswordValid = await bcrypt.compare(password, learner.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  // Generate JWT Token
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError(
      "JWT Secret configuration missing",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const token = jwt.sign(
    {
      id: learner._id,
      email: learner.email,
      title: learner.title,
    },
    jwtSecret,
    { expiresIn: "1d" },
  );

  return { token, learner };
};

import { Request, Response, NextFunction } from "express";
import { AppError } from "../common/errors/api-error";
import { ZodError } from "zod";
import { StatusCodes } from "../common/errors/statusCodes";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Error middleware caught:", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Custom API error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown error
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong: " + err.message,
    },
  });
}

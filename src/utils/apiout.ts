import { Response } from "express";

export const returnSuccessResponse = (
  res: Response,
  statusCode: number,
  response: any,
) => {
  const out = {
    status: "success",
    statusCode,
    result: response,
  };
  res.status(statusCode).json(out);
};

export const returnErrorResponse = (
  res: Response,
  statusCode: number,
  message: any,
) => {
  let code = statusCode;
  let msg;
  if (!code || typeof code !== "number") {
    msg = "Internal Server Error";
    code = 500;
  } else {
    try {
      msg = JSON.parse(message);
    } catch (err) {
      msg = message;
    }
  }

  const out = {
    status: "failure",
    statusCode: code,
    result: { error: msg },
  };
  res.status(code).json(out);
};

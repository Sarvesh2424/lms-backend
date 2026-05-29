import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
export const validate =
  (schema: ZodObject, property: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };

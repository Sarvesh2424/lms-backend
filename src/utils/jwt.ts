import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
}

export function verifyToken<T>(token: string) {
  return jwt.verify(token, env.JWT_SECRET as string) as T;
}

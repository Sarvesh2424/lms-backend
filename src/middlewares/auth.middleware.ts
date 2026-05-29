import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
// import { Permissions } from "../models/permissions.model";

interface JwtPayload {
  id: string;
  role: string;
  orgId: string;
  permissionId: string;
  permissions?: Record<string, Record<string, boolean>>;
}

export const authenticate =
  (cookieName: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[cookieName];

    if (!token) {
      return next(
        new AppError("Authentication token missing", StatusCodes.UNAUTHORIZED),
      );
    }

    try {
      const payload = verifyToken<JwtPayload>(token);
      let permissions = {};
      // if (payload.role === "subadmin" && payload.permissionId) {
      //   const permDoc = await Permissions.findById(payload.permissionId).select(
      //     "permissions",
      //   );
      //   permissions = permDoc?.permissions || {};
      // }
      // console.log("permissions in auth middleware:", permissions);
      req.user = {
        id: payload.id,
        role: payload.role,
        orgId: payload.orgId,
        permissions: permissions,
      };

      next();
    } catch {
      next(
        new AppError("Invalid authentication token", StatusCodes.UNAUTHORIZED),
      );
    }
  };

// Export as authMiddleware to match the import in routes
export const authMiddleware = authenticate;

export const authenticateAny =
  (...cookieNames: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    for (const name of cookieNames) {
      if (req.cookies[name]) {
        token = req.cookies[name];
        break;
      }
    }

    if (!token) {
      return next(
        new AppError("Authentication token missing", StatusCodes.UNAUTHORIZED),
      );
    }

    try {
      const payload = verifyToken<JwtPayload>(token);

      req.user = {
        id: payload.id,
        role: payload.role,
        orgId: payload.orgId,
        permissions: payload.permissions, // Include permissions if available
      };

      next();
    } catch {
      next(
        new AppError("Invalid authentication token", StatusCodes.UNAUTHORIZED),
      );
    }
  };

// Authorize roles middleware
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "Access denied. You do not have permission to perform this action",
          StatusCodes.FORBIDDEN,
        ),
      );
    }
    next();
  };
};

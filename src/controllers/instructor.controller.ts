import { Request, Response } from "express";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import { StatusCodes } from "../common/errors/statusCodes";
import {
  assignmentService,
  changeInstructorPassword,
  createCourse,
  deleteInstructorAccount,
  getInstructorProfile,
  getInstructorSessions,
  logoutInstructor,
  revokeInstructorSession,
  toggleInstructorTwoFactor,
  updateInstructorEmail,
  updateInstructorPreferences,
  updateInstructorProfile,
} from "../services/instructor.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getInstructorProfileController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const profile = await getInstructorProfile(instructorId);
    returnSuccessResponse(res, StatusCodes.OK, profile);
  },
);

export const createAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = req.body;

    const newAssignment = await assignmentService.create(validatedData);

    // Dispatch uniform success response with your standard envelope structure
    return returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Assignment created successfully",
      assignment: {
        id: newAssignment._id, // Normalize the database identifier handle
        ...newAssignment,
      },
    });
  },
);

export const updateProfileHandler = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const updated = await updateInstructorProfile(instructorId, req.body);
    returnSuccessResponse(res, StatusCodes.OK, updated);
  },
);

export const changeEmailController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const updated = await updateInstructorEmail(
      instructorId,
      req.body.email,
      req.body.currentPassword,
    );
    returnSuccessResponse(res, StatusCodes.OK, updated);
  },
);

export const changePasswordController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    await changeInstructorPassword(
      instructorId,
      req.body.currentPassword,
      req.body.newPassword,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Password updated. You've been logged out of other devices.",
    });
  },
);

export const updatePreferencesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const updated = await updateInstructorPreferences(instructorId, req.body);
    returnSuccessResponse(res, StatusCodes.OK, updated);
  },
);

export const toggleTwoFactorController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const updated = await toggleInstructorTwoFactor(
      instructorId,
      req.body.enabled,
    );
    returnSuccessResponse(res, StatusCodes.OK, updated);
  },
);

export const getSessionsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const currentTokenId = (req.user as any).tokenId; // see note below
    const sessions = await getInstructorSessions(instructorId, currentTokenId);
    returnSuccessResponse(res, StatusCodes.OK, sessions);
  },
);

export const revokeSessionController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    await revokeInstructorSession(instructorId, req.params.sessionId);
    returnSuccessResponse(res, StatusCodes.OK, { message: "Session revoked" });
  },
);

export const logoutController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    const currentTokenId = (req.user as any).tokenId;
    await logoutInstructor(instructorId, currentTokenId);
    res.clearCookie("instructor_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    returnSuccessResponse(res, StatusCodes.OK, { message: "Logged out" });
  },
);

export const deleteAccountController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.user as any)._id || (req.user as any).id;
    await deleteInstructorAccount(instructorId, req.body.password);
    res.clearCookie("instructor_token");
    returnSuccessResponse(res, StatusCodes.OK, { message: "Account deleted" });
  },
);

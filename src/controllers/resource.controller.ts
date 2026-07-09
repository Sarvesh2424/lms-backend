import { Response } from "express";
import { AppError } from "../common/errors/api-error";
import { StatusCodes } from "../common/errors/statusCodes";
import { asyncHandler } from "../utils/asyncHandler";
import { returnSuccessResponse } from "../utils/apiout";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { uploadResourceFile } from "../services/upload.service";
import {
  createUploadedResource,
  createLinkResource,
  listResources,
  getResourceStats,
  deleteResource,
  toggleResourceShare,
  recordResourceDownload,
} from "../services/resource.service";

const getInstructorId = (req: AuthenticatedRequest) =>
  (req.user as any)._id || (req.user as any).id;

export const uploadResourceController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new AppError(
        "No file detected. Please attach a file under the 'file' field key.",
        StatusCodes.BAD_REQUEST,
      );
    }

    const uploaded = await uploadResourceFile(req.file);
    const resource = await createUploadedResource(getInstructorId(req), {
      name: req.file.originalname,
      type: uploaded.type,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      url: uploaded.publicUrl,
      course: req.body.course,
    });

    returnSuccessResponse(res, StatusCodes.CREATED, resource);
  },
);

export const createLinkResourceController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const resource = await createLinkResource(getInstructorId(req), req.body);
    returnSuccessResponse(res, StatusCodes.CREATED, resource);
  },
);

export const listResourcesController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { course, type, search, page, limit } = req.query as Record<
      string,
      string
    >;
    const result = await listResources(getInstructorId(req), {
      course,
      type,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    returnSuccessResponse(res, StatusCodes.OK, result);
  },
);

export const getResourceStatsController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await getResourceStats(getInstructorId(req));
    returnSuccessResponse(res, StatusCodes.OK, stats);
  },
);

export const deleteResourceController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await deleteResource(getInstructorId(req), req.params.resourceId);
    returnSuccessResponse(res, StatusCodes.OK, { message: "Resource deleted" });
  },
);

export const toggleResourceShareController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await toggleResourceShare(
      getInstructorId(req),
      req.params.resourceId,
    );
    returnSuccessResponse(res, StatusCodes.OK, result);
  },
);

export const downloadResourceController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const resource = await recordResourceDownload(
      getInstructorId(req),
      req.params.resourceId,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      url: resource.url,
      downloadCount: resource.downloadCount,
    });
  },
);

import { StatusCodes } from "../common/errors/statusCodes";
import { returnSuccessResponse } from "../utils/apiout";
import { asyncHandler } from "../utils/asyncHandler";
import * as certificateService from "../services/certificate.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppError } from "../common/errors/api-error";

const instructorId = (req: AuthenticatedRequest) =>
  (req.user as any)._id || (req.user as any).id;

// Templates

export const createTemplateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const template = await certificateService.createTemplate(
      instructorId(req),
      req.body,
    );
    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Template created successfully",
      template,
    });
  },
);

export const updateTemplateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const template = await certificateService.updateTemplate(
      req.params.id,
      instructorId(req),
      req.body,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Template updated successfully",
      template,
    });
  },
);

export const duplicateTemplateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const template = await certificateService.duplicateTemplate(
      req.params.id,
      instructorId(req),
    );
    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Template duplicated successfully",
      template,
    });
  },
);

export const deleteTemplateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    await certificateService.deleteTemplate(req.params.id, instructorId(req));
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Template deleted successfully",
    });
  },
);

export const getTemplateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const template = await certificateService.getTemplateById(
      req.params.id,
      instructorId(req),
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Template fetched successfully",
      template,
    });
  },
);

export const listTemplatesController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const templates = await certificateService.listTemplates(instructorId(req));
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Templates fetched successfully",
      templates,
    });
  },
);

// Course certificates

export const upsertCourseCertificateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const courseCertificate = await certificateService.upsertCourseCertificate(
      req.params.courseId,
      instructorId(req),
      req.body,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Certificate saved successfully",
      courseCertificate,
    });
  },
);

export const getCourseCertificateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const courseCertificate = await certificateService.getCourseCertificate(
      req.params.courseId,
      instructorId(req),
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Certificate fetched successfully",
      courseCertificate,
    });
  },
);

export const listCourseCertificatesController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const courseCertificates = await certificateService.listCourseCertificates(
      instructorId(req),
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Certificates fetched successfully",
      courseCertificates,
    });
  },
);

export const deleteCourseCertificateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    await certificateService.deleteCourseCertificate(
      req.params.courseId,
      instructorId(req),
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Certificate deleted successfully",
    });
  },
);

// Issuance

export const issueCertificateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const issuedCertificate = await certificateService.issueCertificate(
      req.params.courseId,
      instructorId(req),
      req.body,
    );
    returnSuccessResponse(res, StatusCodes.CREATED, {
      message: "Certificate issued successfully",
      issuedCertificate,
    });
  },
);

export const listIssuedCertificatesController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { courseId, search } = req.query as Record<string, string>;
    const issuedCertificates = await certificateService.listIssuedCertificates(
      instructorId(req),
      { courseId, search },
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Issued certificates fetched successfully",
      issuedCertificates,
    });
  },
);

export const revokeCertificateController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const issuedCertificate = await certificateService.revokeCertificate(
      req.params.id,
      instructorId(req),
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Certificate revoked successfully",
      issuedCertificate,
    });
  },
);

// Public

export const verifyCertificateController = asyncHandler(async (req, res) => {
  const result = await certificateService.verifyCertificate(req.params.code);
  returnSuccessResponse(res, StatusCodes.OK, {
    message: "Certificate verified",
    ...result,
  });
});

export const uploadCertificateAssetController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded.", StatusCodes.BAD_REQUEST);
    }
    const kind = req.query.kind === "signature" ? "signature" : "logo";
    const result = await certificateService.uploadCertificateAsset(
      instructorId(req),
      req.file,
      kind,
    );
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Asset uploaded successfully",
      ...result,
    });
  },
);

export const getMyCertificatesController = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const learnerId = (req.user as any)._id || (req.user as any).id;
    const overview =
      await certificateService.getLearnerCertificateOverview(learnerId);
    returnSuccessResponse(res, StatusCodes.OK, {
      message: "Certificates fetched successfully",
      ...overview,
    });
  },
);

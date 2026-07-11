import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  CreateCertificateTemplateZodSchema,
  UpdateCertificateTemplateZodSchema,
  UpsertCourseCertificateZodSchema,
  IssueCertificateZodSchema,
} from "../schemas/certificate.schema";
import * as certificateController from "../controllers/certificate.controller";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const router = Router();

// Templates
router.post(
  "/templates",
  authMiddleware("instructor_token"),
  validate(CreateCertificateTemplateZodSchema),
  certificateController.createTemplateController,
);
router.get(
  "/templates",
  authMiddleware("instructor_token"),
  certificateController.listTemplatesController,
);
router.get(
  "/templates/:id",
  authMiddleware("instructor_token"),
  certificateController.getTemplateController,
);
router.patch(
  "/templates/:id",
  authMiddleware("instructor_token"),
  validate(UpdateCertificateTemplateZodSchema),
  certificateController.updateTemplateController,
);
router.post(
  "/templates/:id/duplicate",
  authMiddleware("instructor_token"),
  certificateController.duplicateTemplateController,
);
router.delete(
  "/templates/:id",
  authMiddleware("instructor_token"),
  certificateController.deleteTemplateController,
);

// Course certificates (1 course -> 1 certificate)
router.get(
  "/courses",
  authMiddleware("instructor_token"),
  certificateController.listCourseCertificatesController,
);
router.get(
  "/courses/:courseId",
  authMiddleware("instructor_token"),
  certificateController.getCourseCertificateController,
);
router.put(
  "/courses/:courseId",
  authMiddleware("instructor_token"),
  validate(UpsertCourseCertificateZodSchema),
  certificateController.upsertCourseCertificateController,
);
router.delete(
  "/courses/:courseId",
  authMiddleware("instructor_token"),
  certificateController.deleteCourseCertificateController,
);

// Issuance
router.post(
  "/courses/:courseId/issue",
  authMiddleware("instructor_token"),
  validate(IssueCertificateZodSchema),
  certificateController.issueCertificateController,
);
router.get(
  "/issued",
  authMiddleware("instructor_token"),
  certificateController.listIssuedCertificatesController,
);
router.post(
  "/issued/:id/revoke",
  authMiddleware("instructor_token"),
  certificateController.revokeCertificateController,
);

router.post(
  "/upload-asset",
  authMiddleware("instructor_token"),
  uploadMiddleware.single("image"),
  certificateController.uploadCertificateAssetController,
);

// Public verification - no auth
router.get("/verify/:code", certificateController.verifyCertificateController);

export default router;

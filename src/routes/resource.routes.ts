import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { uploadResourceMiddleware } from "../middlewares/upload.middleware";
import {
  createResourceUploadSchema,
  createLinkResourceSchema,
  listResourcesQuerySchema,
  resourceIdParamSchema,
} from "../schemas/resource.schema";
import {
  uploadResourceController,
  createLinkResourceController,
  listResourcesController,
  getResourceStatsController,
  deleteResourceController,
  toggleResourceShareController,
  downloadResourceController,
} from "../controllers/resource.controller";

const router = Router();

router.use(authMiddleware("instructor_token"));

router.get("/", validate(listResourcesQuerySchema), listResourcesController);
router.get("/stats", getResourceStatsController);

router.post(
  "/upload",
  uploadResourceMiddleware.single("file"),
  validate(createResourceUploadSchema),
  uploadResourceController,
);
router.post(
  "/link",
  validate(createLinkResourceSchema),
  createLinkResourceController,
);

router.delete(
  "/:resourceId",
  validate(resourceIdParamSchema),
  deleteResourceController,
);
router.patch(
  "/:resourceId/share",
  validate(resourceIdParamSchema),
  toggleResourceShareController,
);
router.post(
  "/:resourceId/download",
  validate(resourceIdParamSchema),
  downloadResourceController,
);

export default router;

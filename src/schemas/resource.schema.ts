import { z } from "zod";

// multipart form fields arrive as strings, so course is validated as a string here,
// not coerced — ObjectId validity is checked in the service layer against the DB.
export const createResourceUploadSchema = z.object({
  body: z.object({
    course: z.string().optional(),
  }),
});

export const createLinkResourceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(255),
    url: z.string().trim().url("Enter a valid URL"),
    course: z.string().optional(),
  }),
});

export const listResourcesQuerySchema = z.object({
  query: z.object({
    course: z.string().optional(),
    type: z.enum(["pdf", "doc", "video", "image", "link", "other"]).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const resourceIdParamSchema = z.object({
  params: z.object({
    resourceId: z.string().min(1),
  }),
});

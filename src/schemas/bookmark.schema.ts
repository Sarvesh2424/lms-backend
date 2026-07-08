import { z } from "zod";
import { Types } from "mongoose";

const objectId = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid course ID",
});

export const ToggleBookmarkBodySchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum([
      "lesson",
      "video",
      "note",
      "pdf",
      "quiz",
      "discussion",
      "resource",
      "course",
    ]),
    note: z.string().optional(),
  }),
});

export const BookmarkParamsSchema = z.object({
  params: z.object({
    courseId: objectId,
  }),
});

export type IBookmark = z.infer<typeof ToggleBookmarkBodySchema>["body"] & {
  learner: string;
  course: string;
};

import { z } from "zod";

export const BookmarkZodSchema = z.object({
  body: z.object({
    learner: z.string().min(1, "Course title or reference identifier is required"),
    title: z.string().min(1, "Title is required"),
    type: z.enum([
      "lesson",
      "video",
      "note",
      "pdf",
      "quiz",
      "discussion",
      "resource",
    ]),
    course: z
      .string()
      .min(1, "Course title or reference identifier is required"),
    note: z.string().optional(),
  }),
});

export type IBookmark = z.infer<typeof BookmarkZodSchema>["body"];

import { z } from "zod";

export const WorkspaceNoteZodSchema = z.object({
  body: z.object({
    learner: z
      .string()
      .min(1, "Associated course metadata name is required")
      .trim(),
    title: z.string().min(1, "Note title cannot be blank").trim(),
    excerpt: z
      .string()
      .min(1, "A brief text excerpt summary is required")
      .trim(),
    course: z
      .string()
      .min(1, "Associated course metadata name is required")
      .trim(),
  }),
});

export type IWorkspaceNote = z.infer<typeof WorkspaceNoteZodSchema>["body"];

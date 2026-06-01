import { z } from "zod";

export const AssignmentZodSchema = z
  .object({
    body: z.object({
      title: z.string().min(1, "Title is required"),
      course: z.string().min(1, "Course identifier/name is required"),
      status: z.enum(["pending", "submitted", "overdue", "graded"]).optional(),
      due: z.coerce.date(),
      priority: z.enum(["high", "medium", "low"]),

      // Configured as an optional number capped between a standard 0-100% scale
      grade: z.number().min(0).max(100).optional(),
      feedback: z.string().optional(),
    }),
  })
  // Custom refine rule: If status is 'graded', enforce that a numeric grade is present
  .refine(
    (data) => {
      if (data.body.status === "graded" && data.body.grade === undefined) {
        return false;
      }
      return true;
    },
    {
      message:
        "A numerical grade score is required when status is marked as 'graded'",
      path: ["grade"],
    },
  );

export type IAssignment = z.infer<typeof AssignmentZodSchema>["body"];

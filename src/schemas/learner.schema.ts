import { z } from "zod";

export const LearnerProfileZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    initials: z.string().max(3, "Initials should be short").optional(),
    email: z.string().email("Invalid email address"),
    title: z.string().optional().default("Beginner"),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.number().nonnegative("Stats values cannot be negative"),
        }),
      )
      .optional()
      .default([
        { label: "Courses", value: 0 },
        { label: "Certificates", value: 0 },
        { label: "Day Streak", value: 0 },
        { label: "Hours Learned", value: 0 },
      ]),
  }),
});

export type LearnerProfileInput = z.infer<
  typeof LearnerProfileZodSchema
>["body"];

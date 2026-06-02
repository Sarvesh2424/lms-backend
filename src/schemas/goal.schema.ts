import { z } from "zod";

export const GoalZodSchema = z.object({
  body: z.object({
    learner: z.string().min(1),
    label: z
      .string()
      .min(1, "Goal label title description cannot be blank")
      .trim(),

    // Ensures progress cannot drop below zero
    current: z
      .number()
      .min(0, "Current progress value must be 0 or higher")
      .optional(),

    // Ensures target value is a positive non-zero metric configuration
    target: z
      .number()
      .positive("Target parameter threshold must be greater than 0"),

    unit: z
      .string()
      .min(
        1,
        "Measurement unit metric identifier (e.g., 'hrs', 'modules') is required",
      )
      .trim(),
  }),
});

export type IGoal = z.infer<typeof GoalZodSchema>["body"];

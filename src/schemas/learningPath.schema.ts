import { z } from "zod";

// Step validation matching your course node layout
export const PathStepZodSchema = z.object({
  courseId: z.string(),
});

// Main Learning Path validation
export const LearningPathZodSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Path title is required"),
    goal: z.string().min(1, "Goal description is required"),
    outcome: z.string().min(1, "Outcome statement is required"),
    image: z
      .string()
      .url("Image must be a valid asset path or absolute URL string"), // Replacing hue with image
    steps: z
      .array(PathStepZodSchema)
      .min(1, "A learning path must contain at least one step"),
  }),
});

// Infer TypeScript types cleanly from the Zod configuration models
export type PathStep = z.infer<typeof PathStepZodSchema>;
export type LearningPath = z.infer<typeof LearningPathZodSchema>["body"];

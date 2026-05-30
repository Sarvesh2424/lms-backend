import { z } from "zod";

const LessonZodSchema = z.object({
  title: z.string().min(1),
  durationMins: z.number().positive(),
});

const SyllabusModuleZodSchema = z.object({
  module: z.string().min(1),
  lessons: z.array(LessonZodSchema).min(1),
  durationMins: z.number().nonnegative().optional(), // Marked optional since middleware handles it
});

export const CourseZodSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    instructor: z
      .string()
      .min(1, "Instructor profile reference or name is required"), // Can be converted to User ObjectId string later
    category: z.string().min(1, "Category is required"),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    rating: z.number().min(0).max(5).default(0),
    reviews: z.number().int().nonnegative().default(0),
    thumbnail: z.string(),
    tags: z.array(z.string()).default([]),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    outcomes: z.array(z.string()).default([]),
    syllabus: z
      .array(SyllabusModuleZodSchema)
      .min(1, "Course must have at least one syllabus module"),
      progress:z.number().optional()
  }),
});

// Infer TypeScript verification types directly from your Zod layer constraints
export type CourseInput = z.infer<typeof CourseZodSchema>["body"];

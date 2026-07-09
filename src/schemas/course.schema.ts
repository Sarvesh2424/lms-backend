import { z } from "zod";
import { LESSON_TYPES } from "../types/course.constants";

const LessonZodSchema = z.object({
  title: z.string().min(1),
  type: z.enum(LESSON_TYPES),
  durationMins: z.number().positive(),
  order: z.number().int().nonnegative().optional(),
  isPreview: z.boolean().optional(),
  content: z.any().optional(),
});

const SyllabusModuleZodSchema = z.object({
  module: z.string().min(1),
  order: z.number().int().nonnegative().optional(),
  lessons: z.array(LessonZodSchema).min(1),
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

const priceSchema = z.object({
  amount: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
});

// instructor, status, slug, and all computed/lifecycle fields are intentionally
// absent here - they're either server-derived (auth token) or service-owned.
export const CreateCourseZodSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    category: z.string().min(1),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    thumbnail: z.string().min(1),
    tags: z.array(z.string()).default([]),
    description: z.string().min(10),
    outcomes: z.array(z.string()).default([]),
    syllabus: z.array(SyllabusModuleZodSchema).min(1),
    price: priceSchema.optional(),
    isFree: z.boolean().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const UpdateCourseZodSchema = z.object({
  body: z
    .object({
      title: z.string().min(3).max(100),
      category: z.string().min(1),
      level: z.enum(["Beginner", "Intermediate", "Advanced"]),
      thumbnail: z.string().min(1),
      tags: z.array(z.string()),
      description: z.string().min(10),
      outcomes: z.array(z.string()),
      syllabus: z.array(SyllabusModuleZodSchema).min(1),
      price: priceSchema,
      isFree: z.boolean(),
      seoDescription: z.string(),
      expectedRevision: z.number().int().nonnegative(),
    })
    .partial()
    .required({ expectedRevision: true }), // every update must state which version it's editing
});

export const ScheduleCourseZodSchema = z.object({
  body: z.object({
    scheduledPublishAt: z.coerce.date(),
  }),
});

export const RejectCourseZodSchema = z.object({
  body: z.object({
    notes: z.string().min(3),
  }),
});

// Infer TypeScript verification types directly from your Zod layer constraints
export type CourseInput = z.infer<typeof CourseZodSchema>["body"];

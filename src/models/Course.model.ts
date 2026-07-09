import { Schema, model } from "mongoose";
import { COURSE_STATUS, LESSON_TYPES } from "../types/course.constants";

const LessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: LESSON_TYPES },
    durationMins: { type: Number, required: true, min: 0 },
    order: { type: Number, required: true, default: 0 },
    isPreview: { type: Boolean, default: false },
    content: { type: Schema.Types.Mixed }, // shape varies by lesson type
  },
  { _id: false },
);

const SyllabusModuleSchema = new Schema(
  {
    module: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 },
    lessons: [LessonSchema],
    durationMins: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const CourseSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    instructor: { type: Schema.Types.ObjectId, ref: "Instructor", required: true, index: true },
    category: { type: String, required: true, index: true, trim: true },
    level: { type: String, required: true, enum: ["Beginner", "Intermediate", "Advanced"], index: true },

    status: {
      type: String,
      required: true,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
      index: true,
    },
    reviewNotes: { type: String, default: null },
    hasUnpublishedChanges: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    scheduledPublishAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    version: { type: Number, default: 0 }, // bumped only on publish - a content version, not a concurrency token
    revision: { type: Number, default: 0 }, // bumped on every write - used for optimistic locking

    price: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: "USD" },
    },
    isFree: { type: Boolean, default: true },
    seoDescription: { type: String, default: "" },

    durationHrs: { type: Number, required: true, default: 0, min: 0 },
    lessonsCount: { type: Number, required: true, default: 0, min: 0 },
    rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
    reviews: { type: Number, required: true, default: 0, min: 0 },
    enrollmentsCount: { type: Number, required: true, default: 0, min: 0 },
    thumbnail: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    description: { type: String, required: true },
    outcomes: [{ type: String, trim: true }],
    syllabus: [SyllabusModuleSchema],
  },
  { timestamps: true },
);

CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ rating: -1 });
CourseSchema.index({ instructor: 1, status: 1 }); // "my courses" tab queries

export const Course = model("Course", CourseSchema);
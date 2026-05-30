import { Schema, model } from "mongoose";

const LessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    durationMins: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const SyllabusModuleSchema = new Schema(
  {
    module: { type: String, required: true, trim: true },
    lessons: [LessonSchema],
    durationMins: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const CourseSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    category: { type: String, required: true, index: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
      index: true,
    },
    durationHrs: { type: Number, required: true, default: 0, min: 0 },
    lessonsCount: { type: Number, required: true, default: 0, min: 0 },
    rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
    reviews: { type: Number, required: true, default: 0, min: 0 },
    thumbnail: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    description: { type: String, required: true },
    outcomes: [{ type: String, trim: true }],
    syllabus: [SyllabusModuleSchema],
  },
  {
    timestamps: true,
  },
);

CourseSchema.pre("save",async function () {
  let totalCourseMins = 0;
  let totalLessonsCounter = 0;

  // Iterate over each module in the syllabus array
  for (const mod of this.syllabus) {
    // Calculate Module Duration: Sum of individual lesson durations
    const moduleMins = mod.lessons.reduce(
      (sum, lesson) => sum + lesson.durationMins,
      0,
    );

    mod.durationMins = moduleMins; // Set module total
    totalCourseMins += moduleMins; // Add to global course tracking accumulator
    totalLessonsCounter += mod.lessons.length;
  }

  // Calculate Course Duration: Convert aggregate course minutes to hours (rounded to 1 decimal place)
  this.durationHrs = Math.round((totalCourseMins / 60) * 10) / 10;
  this.lessonsCount = totalLessonsCounter;

});

// High-speed indices for compound course marketplace filter tabs
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ rating: -1 });

export const Course = model("Course", CourseSchema);

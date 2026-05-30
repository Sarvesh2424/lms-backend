import mongoose, { Schema } from "mongoose";

const StatSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false },
);

const EnrolledCoursedSchema = new mongoose.Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const LearnerProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    initials: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, default: "Beginner" },
    stats: {
      type: [StatSchema],
      default: [
        {
          label: "Courses",
          value: 0,
        },
        {
          label: "Certificates",
          value: 0,
        },
        {
          label: "Day Streak",
          value: 0,
        },
        {
          label: "Hours Learned",
          value: 0,
        },
      ],
    },
    enrolledCourses: { type: [EnrolledCoursedSchema], default: [] },
  },
  { timestamps: true },
);

export const Learner =
  mongoose.models.Learner || mongoose.model("Learner", LearnerProfileSchema);

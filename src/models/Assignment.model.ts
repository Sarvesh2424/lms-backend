import { Schema, model } from "mongoose";

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "overdue", "graded"],
      default: "pending",
      required: true,
    },
    due: {
      type: Schema.Types.Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
      required: true,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: { type: String, trim: true },
  },
  {
    timestamps: true, // Tracks createdAt and updatedAt changes automatically
  },
);

export const Assignment = model("Assignment", AssignmentSchema);

import { Schema, model, Document, Types } from "mongoose";

// Nested Step Schema Definition Block
const PathStepSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" }, // Relational lookup validation bridge
    status: {
      type: String,
      enum: ["done", "active", "locked"],
      default: "locked",
      required: true,
    },
    durationHrs: { type: Number, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
  },
  { _id: false },
); // Prevents Mongoose from creating subdocument tracking _ids for every array element

// Root Learning Path Mapping
const LearningPathSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    goal: { type: String, required: true },
    outcome: { type: String, required: true },
    totalHrs: { type: Number, required: true, default: 0 },
    progress: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    steps: [PathStepSchema],
  },
  {
    timestamps: true, // Automatically sets up createdAt and updatedAt timestamps
  },
);

LearningPathSchema.pre("save", async function () {
  if (this.steps && this.steps.length > 0) {
    const rawSum = this.steps.reduce(
      (sum, step) => sum + (step.durationHrs || 0),
      0,
    );
    this.totalHrs = Number(rawSum.toFixed(1));
  } else {
    this.totalHrs = 0;
  }
});

export const LearningPath = model("LearningPath", LearningPathSchema);

import { Schema, model, Document } from "mongoose";

const GoalSchema = new Schema(
  {
    learner: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    current: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    target: {
      type: Number,
      required: true,
      min: 0.01, // Protects database metrics calculation against divide-by-zero errors
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    // Automatically handles lifecycle timestamps for tracking updates
    timestamps: true,
  },
);

export const Goal = model("Goal", GoalSchema);

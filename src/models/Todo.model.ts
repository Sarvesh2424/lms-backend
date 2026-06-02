import { Schema, model, Document } from "mongoose";

const TodoSchema = new Schema(
  {
    learner: { type: Schema.Types.ObjectId, ref: "Learner", required: true },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    done: {
      type: Boolean,
      required: true,
      default: false,
    },
    due: {
      type: Date,
      required: false, // Optional parameter support
    },
  },
  {
    timestamps: true, // Handles automated tracker options like createdAt/updatedAt
  },
);

export const Todo = model("Todo", TodoSchema);

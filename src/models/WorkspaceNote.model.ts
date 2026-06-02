import { Schema, model, Document } from "mongoose";

const WorkspaceNoteSchema = new Schema(
  {
    learner: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const WorkspaceNote = model("WorkspaceNote", WorkspaceNoteSchema);

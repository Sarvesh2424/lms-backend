import { Schema, model, Document, Types } from "mongoose";

const BookmarkSchema = new Schema(
  {
    learner: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "lesson",
        "video",
        "note",
        "pdf",
        "quiz",
        "discussion",
        "resource",
      ],
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds and tracks standard createdAt and updatedAt properties automatically
  },
);

export const Bookmark = model("Bookmark", BookmarkSchema);

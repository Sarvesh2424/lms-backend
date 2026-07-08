import { Schema, model } from "mongoose";

const BookmarkSchema = new Schema(
  {
    learner: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
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
        "course",
      ],
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

// A learner can only bookmark a given course once — enforced at the DB level,
// not just client-side, so concurrent double-clicks can't create duplicates.
BookmarkSchema.index({ learner: 1, course: 1 }, { unique: true });

export const Bookmark = model("Bookmark", BookmarkSchema);

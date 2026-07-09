import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null, // null = "All courses"
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    type: {
      type: String,
      enum: ["pdf", "doc", "video", "image", "link", "other"],
      required: true,
    },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    url: { type: String, required: true },
    isExternalLink: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    shareToken: { type: String, default: null, unique: true, sparse: true },
  },
  { timestamps: true },
);

ResourceSchema.index({ instructor: 1, createdAt: -1 });
ResourceSchema.index({ instructor: 1, course: 1 });

export const Resource =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

import mongoose from "mongoose";

const InstructorProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    expertise: { type: [String], default: [] },
    avatarUrl: { type: String, default: "" },
    badges: { type: [String], default: [] }, // e.g. "Top Instructor 2026"
  },
  { timestamps: true },
);

export const Instructor =
  mongoose.models.Instructor ||
  mongoose.model("Instructor", InstructorProfileSchema);

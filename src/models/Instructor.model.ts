import mongoose from "mongoose";

const InstructorProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true },
);

export const Instructor =
  mongoose.models.Instructor || mongoose.model("Instructor", InstructorProfileSchema);

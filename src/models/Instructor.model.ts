import mongoose from "mongoose";

const NotificationPrefsSchema = new mongoose.Schema(
  {
    emailDigest: { type: Boolean, default: true },
    newSubmissions: { type: Boolean, default: true },
    studentMessages: { type: Boolean, default: true },
    paymentReceived: { type: Boolean, default: true },
    weeklyAnalytics: { type: Boolean, default: true },
  },
  { _id: false },
);

const InstructorProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    title: { type: String, default: "" }, // "Designation" in the UI
    organization: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    expertise: { type: [String], default: [] }, // "Skills" in the UI
    experience: { type: String, default: "" },
    languages: { type: [String], default: [] },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    badges: { type: [String], default: [] },
    twoFactorEnabled: { type: Boolean, default: false },
    preferences: {
      theme: { type: String, enum: ["system", "light", "dark"], default: "system" },
      language: { type: String, default: "en" },
      timezone: { type: String, default: "Asia/Kolkata" },
      notifications: { type: NotificationPrefsSchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

export const Instructor =
  mongoose.models.Instructor ||
  mongoose.model("Instructor", InstructorProfileSchema);
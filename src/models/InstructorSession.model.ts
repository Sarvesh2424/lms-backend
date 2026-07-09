import mongoose from "mongoose";

const InstructorSessionSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    tokenId: { type: String, required: true, unique: true }, // must match a `jti` claim in the JWT — see note at the end
    device: { type: String, default: "" }, // e.g. "MacBook Pro · Chrome"
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    location: { type: String, default: "" },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const InstructorSession =
  mongoose.models.InstructorSession ||
  mongoose.model("InstructorSession", InstructorSessionSchema);

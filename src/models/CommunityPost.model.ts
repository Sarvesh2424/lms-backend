import { Schema, model } from "mongoose";

// Subdocument Schema for cleaner array encapsulation
const ReplySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Learner", required: true },
    reply: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const CommunityPostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Learner", required: true },
    role: {
      type: String,
      required: true,
      enum: ["Learner", "Mentor", "Instructor"],
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    replies: { type: [ReplySchema], default: [] },
    likes: { type: Number, required: true, default: 0, min: 0 },
    trending: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  },
);

CommunityPostSchema.index({ author: 1 });
export const CommunityPost = model("CommunityPost", CommunityPostSchema);

import { model, Schema } from "mongoose";

const StudyGroupSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "Learner" }], // Array of relationships
    active: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

// Indexes for super-fast lookups on group names and membership checks
StudyGroupSchema.index({ name: 1 });
StudyGroupSchema.index({ members: 1 });

export const StudyGroup = model("StudyGroup", StudyGroupSchema);

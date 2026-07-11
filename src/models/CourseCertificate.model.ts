import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICourseCertificate extends Document {
  course: Types.ObjectId;
  instructor: Types.ObjectId;
  template: Types.ObjectId;
  minCompletionPct: number;
  minQuizScorePct: number;
  requireCapstone: boolean;
  expiresAfterMonths: number; // 0 = never
  autoIssue: boolean;
  issuedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseCertificateSchema = new Schema<ICourseCertificate>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
      index: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    template: {
      type: Schema.Types.ObjectId,
      ref: "CertificateTemplate",
      required: true,
    },
    minCompletionPct: { type: Number, min: 0, max: 100, default: 100 },
    minQuizScorePct: { type: Number, min: 0, max: 100, default: 80 },
    requireCapstone: { type: Boolean, default: false },
    expiresAfterMonths: { type: Number, min: 0, default: 0 },
    autoIssue: { type: Boolean, default: true },
    issuedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const CourseCertificate = mongoose.model<ICourseCertificate>(
  "CourseCertificate",
  CourseCertificateSchema,
);

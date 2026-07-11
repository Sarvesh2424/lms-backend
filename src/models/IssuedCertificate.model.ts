import mongoose, { Schema, Document, Types } from "mongoose";
import crypto from "crypto";

export interface IIssuedCertificate extends Document {
  course: Types.ObjectId;
  instructor: Types.ObjectId;
  template: Types.ObjectId;
  courseCertificate: Types.ObjectId;
  learner: Types.ObjectId;
  recipientName: string;
  courseTitle: string;
  score: number;
  verificationCode: string;
  status: "issued" | "revoked";
  revokedAt: Date | null;
  expiresAt: Date | null;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IssuedCertificateSchema = new Schema<IIssuedCertificate>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
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
    courseCertificate: {
      type: Schema.Types.ObjectId,
      ref: "CourseCertificate",
      required: true,
    },
    learner: {
      type: Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
      index: true,
    },
    recipientName: { type: String, required: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    score: { type: Number, min: 0, max: 100, required: true },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(8).toString("hex"),
    },
    status: { type: String, enum: ["issued", "revoked"], default: "issued" },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    issuedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

// a learner can only hold one (active or revoked) certificate record per course
IssuedCertificateSchema.index({ course: 1, learner: 1 }, { unique: true });

export const IssuedCertificate = mongoose.model<IIssuedCertificate>(
  "IssuedCertificate",
  IssuedCertificateSchema,
);

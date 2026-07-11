import mongoose, { Schema, Document, Types } from "mongoose";
import {
  CERTIFICATE_BACKGROUND_STYLES,
  CertificateBackgroundStyle,
} from "../types/certificate.constants";

export interface ICertificateTemplate extends Document {
  instructor: Types.ObjectId;
  name: string;
  title: string;
  description: string;
  logoUrl?: string;
  signatureUrl?: string;
  backgroundStyle: CertificateBackgroundStyle;
  usageCount: number; // denormalized - how many CourseCertificates reference this
  createdAt: Date;
  updatedAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Certificate of Completion",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "has successfully completed",
    },
    logoUrl: { type: String },
    signatureUrl: { type: String },
    backgroundStyle: {
      type: String,
      enum: CERTIFICATE_BACKGROUND_STYLES,
      default: "aurora",
    },
    usageCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// an instructor can't have two templates with the same name
CertificateTemplateSchema.index({ instructor: 1, name: 1 }, { unique: true });

export const CertificateTemplate = mongoose.model<ICertificateTemplate>(
  "CertificateTemplate",
  CertificateTemplateSchema,
);

import { z } from "zod";
import { CERTIFICATE_BACKGROUND_STYLES } from "../types/certificate.constants";

export const CreateCertificateTemplateZodSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    title: z.string().min(3).max(120).default("Certificate of Completion"),
    description: z
      .string()
      .min(3)
      .max(200)
      .default("has successfully completed"),
    logoUrl: z.string().url().optional(),
    signatureUrl: z.string().url().optional(),
    backgroundStyle: z.enum(CERTIFICATE_BACKGROUND_STYLES).default("aurora"),
  }),
});

export const UpdateCertificateTemplateZodSchema = z.object({
  body: CreateCertificateTemplateZodSchema.shape.body.partial(),
});

export const UpsertCourseCertificateZodSchema = z.object({
  body: z.object({
    templateId: z.string().min(1, "A template must be selected"),
    minCompletionPct: z.number().min(0).max(100).default(100),
    minQuizScorePct: z.number().min(0).max(100).default(80),
    requireCapstone: z.boolean().default(false),
    expiresAfterMonths: z.number().int().nonnegative().default(0),
    autoIssue: z.boolean().default(true),
  }),
});

export const IssueCertificateZodSchema = z.object({
  body: z.object({
    learnerId: z.string().min(1, "Recipient is required"),
    score: z.number().min(0).max(100),
  }),
});

import { z } from "zod";

export const InstructorRegisterZodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const InstructorLoginZodSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateInstructorProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    title: z.string().max(120).optional(),
    organization: z.string().max(120).optional(),
    bio: z.string().max(2000).optional(),
    location: z.string().max(120).optional(),
    website: z.string().max(200).optional(),
    expertise: z.array(z.string()).optional(),
    experience: z.string().max(60).optional(),
    languages: z.array(z.string()).optional(),
    linkedin: z.string().max(200).optional(),
    portfolio: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

export const changeEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Enter a valid email"),
    currentPassword: z.string().min(1, "Current password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmNewPassword: z.string().min(8),
    })
    .refine((d) => d.newPassword === d.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    theme: z.enum(["system", "light", "dark"]).optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    notifications: z
      .object({
        emailDigest: z.boolean().optional(),
        newSubmissions: z.boolean().optional(),
        studentMessages: z.boolean().optional(),
        paymentReceived: z.boolean().optional(),
        weeklyAnalytics: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const toggleTwoFactorSchema = z.object({
  body: z.object({ enabled: z.boolean() }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required to delete your account"),
  }),
});

export type UpdateInstructorProfileInput = z.infer<
  typeof updateInstructorProfileSchema
>["body"];
export type InstructorRegisterInput = z.infer<
  typeof InstructorRegisterZodSchema
>["body"];
export type InstructorLoginInput = z.infer<
  typeof InstructorLoginZodSchema
>["body"];

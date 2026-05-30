import { z } from "zod";

const ReplyZodSchema = z.object({
  userId: z.string().min(1, "User ID is required for a reply"),
  reply: z.string().min(1, "Reply content cannot be empty"),
  createdAt: z.date().optional(),
});

export const CommunityPostZodSchema = z.object({
  body: z.object({
    author: z.string().min(1, "Author User ID reference is required"),
    role: z.enum(["Learner", "Mentor", "Instructor"]),
    group: z.string().min(1, "Group designation is required"),
    title: z.string().min(3).max(150),
    body: z.string().min(10),
    replies: z.array(ReplyZodSchema).default([]),
    likes: z.number().int().nonnegative().default(0),
    trending: z.boolean().optional().default(false),
  }),
});

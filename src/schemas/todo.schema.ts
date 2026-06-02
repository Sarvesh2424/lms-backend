import { z } from "zod";

export const TodoZodSchema = z.object({
  body: z.object({
    learner: z.string().min(1),
    label: z.string().min(1, "To-do description label cannot be blank").trim(),
    done: z.boolean().default(false),

    // Coerces incoming timestamp strings, ISO metrics, or null values safely into native Dates
    due: z.preprocess((val) => {
      if (!val || val === "") return undefined;
      return val;
    }, z.coerce.date().optional()),
  }),
});

export type ITodo = z.infer<typeof TodoZodSchema>;

import { z } from "zod";

export const createQuizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Quiz title is required.")
    .max(200, "Quiz title is too long."),

  description: z
    .string()
    .trim()
    .max(2000, "Description is too long.")
    .optional(),

  duration_minutes: z
    .number()
    .int("Duration must be a whole number.")
    .min(1, "Duration must be at least 1 minute.")
    .max(600, "Duration cannot exceed 600 minutes."),
});

export type CreateQuizFormData = z.infer<typeof createQuizSchema>;

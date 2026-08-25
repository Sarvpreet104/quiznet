import { z } from "zod";

export const studentListSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "List name is required.")
    .max(100, "List name must be 100 characters or less."),
});

export type StudentListFormData = z.infer<typeof studentListSchema>;

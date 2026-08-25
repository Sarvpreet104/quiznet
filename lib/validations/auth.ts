import { z } from "zod";

// registration schema
export const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(100, "First name must be 100 characters or less."),

    last_name: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(100, "Last name must be 100 characters or less."),

    college_id: z
      .string()
      .trim()
      .min(1, "College ID is required.")
      .max(50, "College ID must be 50 characters or less."),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .max(255, "Email is too long."),

    password: z.string().min(8, "Password must be at least 8 characters."),

    confirm_password: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

// login schema
export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

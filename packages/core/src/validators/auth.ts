/**
 * packages/core/src/validators/auth.ts
 *
 * Validators for the admin auth flows (user login, creation, etc.)
 */

import { z } from "zod";

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const adminSignupSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email().max(255),
  password: passwordField,
});

export type AdminSignupInput = z.infer<typeof adminSignupSchema>;

export const adminLoginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(1),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.email().max(255),
  password: passwordField,
  role: z
    .enum(["owner", "admin", "editor", "author", "contributor"])
    .default("contributor"),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  bio: z.string().max(2000).optional().nullable(),
  avatar: z.url().max(2048).optional().nullable(),
  website: z.url().max(2048).optional().nullable(),
  twitter: z.string().max(255).optional().nullable(),
  facebook: z.string().max(255).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({
    id: z.uuid(),
    new_password: passwordField.optional(),
    current_password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.new_password && !data.current_password) return false;
      return true;
    },
    {
      message: "current_password is required when changing password",
      path: ["current_password"],
    }
  );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

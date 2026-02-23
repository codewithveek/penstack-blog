/**
 * packages/core/src/validators/tier.ts
 *
 * Zod schemas for membership tier CRUD.
 */

import { z } from "zod";

export const createTierSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric and hyphens only",
    })
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  monthly_price_cents: z.number().int().min(0).optional().nullable(),
  yearly_price_cents: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).default("USD"),
  benefits: z.array(z.string()).optional().nullable(),
  active: z.boolean().default(true),
  trial_days: z.number().int().min(0).default(0),
});

export type CreateTierInput = z.infer<typeof createTierSchema>;

export const updateTierSchema = createTierSchema.partial();

export type UpdateTierInput = z.infer<typeof updateTierSchema>;

export const listTiersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  active: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListTiersQuery = z.infer<typeof listTiersQuerySchema>;

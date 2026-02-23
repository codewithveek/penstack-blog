/**
 * packages/core/src/validators/redirect.ts
 *
 * Zod schemas for redirect CRUD.
 */

import { z } from "zod";

export const createRedirectSchema = z.object({
  from_path: z
    .string()
    .min(1)
    .max(2048)
    .startsWith("/", { message: "from_path must start with /" }),
  to_path: z.string().min(1).max(2048),
  type: z.enum(["301", "302"]).default("301"),
  active: z.boolean().default(true),
});

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;

export const updateRedirectSchema = createRedirectSchema.partial();

export type UpdateRedirectInput = z.infer<typeof updateRedirectSchema>;

export const listRedirectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListRedirectsQuery = z.infer<typeof listRedirectsQuerySchema>;

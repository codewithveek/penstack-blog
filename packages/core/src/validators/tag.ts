/**
 * packages/core/src/validators/tag.ts
 */

import { z } from "zod";

const tagSlugField = z
  .string()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric and hyphens only",
  });

export const createTagSchema = z.object({
  name: z.string().min(1).max(255),
  slug: tagSlugField.optional(),
  description: z.string().max(2000).optional().nullable(),
  feature_image: z.string().url().max(512).optional().nullable(),
  visibility: z.enum(["public", "internal"]).default("public"),
  og_title: z.string().max(2000).optional().nullable(),
  og_description: z.string().max(4000).optional().nullable(),
  og_image: z.string().url().max(512).optional().nullable(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema.partial().extend({
  id: z.string().uuid().optional(),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

export const listTagsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  visibility: z.enum(["public", "internal"]).optional(),
});

export type ListTagsQuery = z.infer<typeof listTagsQuerySchema>;

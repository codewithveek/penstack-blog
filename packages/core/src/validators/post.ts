/**
 * packages/core/src/validators/post.ts
 *
 * Zod schemas for post / page create & update.
 * Imported exclusively by Hono route handlers for input validation.
 * PRD §13: "Zod validation on every API input before it reaches a controller"
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Reusable field schemas
// ---------------------------------------------------------------------------

const slugField = z
  .string()
  .min(1)
  .max(2000)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric and hyphens only",
  });

const postAuthorSchema = z.object({
  user_id: z.uuid(),
  role: z.enum(["primary", "co_author", "contributor"]),
  sort_order: z.number().int().min(0),
});

// ---------------------------------------------------------------------------
// Create post
// ---------------------------------------------------------------------------

export const createPostSchema = z.object({
  type: z.enum(["post", "page"]).default("post"),
  title: z.string().min(1).max(500),
  slug: slugField.optional(), // auto-generated from title if omitted
  lexical: z.record(z.string(), z.unknown()).optional().nullable(),
  html: z.string().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  featured_image: z.string().url().max(512).optional().nullable(),
  featured_image_alt: z.string().max(512).optional().nullable(),
  status: z
    .enum(["draft", "published", "scheduled", "archived"])
    .default("draft"),
  visibility: z.enum(["public", "members", "paid"]).default("public"),
  send_newsletter: z.boolean().default(false),
  allow_comments: z.boolean().default(true),
  scheduled_at: z.coerce.date().optional().nullable(),
  // Authors must contain at least one primary
  authors: z
    .array(postAuthorSchema)
    .min(1, "At least one author is required")
    .refine((authors) => authors.some((a) => a.role === "primary"), {
      message: "At least one author must have role 'primary'",
    })
    .optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  newsletter_id: z.string().uuid().optional().nullable(),
  og_title: z.string().max(512).optional().nullable(),
  og_description: z.string().max(512).optional().nullable(),
  og_image: z.string().url().max(512).optional().nullable(),
  twitter_title: z.string().max(512).optional().nullable(),
  twitter_description: z.string().max(512).optional().nullable(),
  twitter_image: z.string().url().max(512).optional().nullable(),
  canonical_url: z.string().url().max(512).optional().nullable(),
  custom_head_code: z.string().max(50000).optional().nullable(),
  custom_foot_code: z.string().max(50000).optional().nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// ---------------------------------------------------------------------------
// Update post (all fields optional except id)
// ---------------------------------------------------------------------------

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// ---------------------------------------------------------------------------
// Publish post
// ---------------------------------------------------------------------------

export const publishPostSchema = z.object({
  id: z.string().uuid(),
  published_at: z.coerce.date().optional(),
});

export type PublishPostInput = z.infer<typeof publishPostSchema>;

// ---------------------------------------------------------------------------
// Post list query params
// ---------------------------------------------------------------------------

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  type: z.enum(["post", "page"]).optional(),
  visibility: z.enum(["public", "members", "paid"]).optional(),
  author_id: z.string().uuid().optional(),
  tag: z.string().optional(),
  search: z.string().max(255).optional(),
  sort_by: z
    .enum(["published_at", "updated_at", "created_at"])
    .default("published_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

/**
 * packages/core/src/validators/webhook.ts
 */

import { z } from "zod";

export const createWebhookSchema = z.object({
  name: z.string().min(1).max(255),
  target_url: z.string().url().max(2048),
  event_triggers: z
    .array(
      z.enum([
        "post.published",
        "post.unpublished",
        "post.deleted",
        "page.published",
        "page.deleted",
        "member.created",
        "member.updated",
        "member.deleted",
        "subscription.created",
        "subscription.canceled",
      ])
    )
    .min(1, "At least one event trigger is required"),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;

export const updateWebhookSchema = createWebhookSchema.partial().extend({
  id: z.string().uuid(),
  active: z.boolean().optional(),
});

export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;

/**
 * Validator for site-level settings update
 */
export const updateSiteSettingsSchema = z.object({
  /** Site metadata */
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  logo: z.string().url().max(2048).optional().nullable(),
  favicon: z.string().url().max(2048).optional().nullable(),
  cover_image: z.string().url().max(2048).optional().nullable(),
  timezone: z.string().max(64).optional(),
  locale: z.string().max(16).optional(),
  /** Permalink pattern (PRD §10) */
  permalink_pattern: z
    .enum([
      "/:slug",
      "/:category/:slug",
      "/:year/:month/:day/:slug",
      "/:year/:month/:slug",
      "/:year/:slug",
    ])
    .optional(),
  /** Custom domain */
  custom_domain: z.string().max(255).optional().nullable(),
  /** Theme slug */
  theme: z.string().max(255).optional(),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

/**
 * Validator for API key creation
 */
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  role: z.enum(["content", "admin"]),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

/**
 * Common pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

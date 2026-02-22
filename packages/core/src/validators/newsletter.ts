/**
 * packages/core/src/validators/newsletter.ts
 */

import { z } from "zod";

export const createNewsletterSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  sender_name: z.string().max(255).optional().nullable(),
  sender_email: z.email().max(255).optional().nullable(),
  reply_to_email: z.email().max(255).optional().nullable(),
  subscribe_on_signup: z.boolean().default(true),
  header_html: z.string().max(50000).optional().nullable(),
  footer_html: z.string().max(50000).optional().nullable(),
});

export type CreateNewsletterInput = z.infer<typeof createNewsletterSchema>;

export const updateNewsletterSchema = createNewsletterSchema.partial().extend({
  id: z.uuid(),
  active: z.boolean().optional(),
});

export type UpdateNewsletterInput = z.infer<typeof updateNewsletterSchema>;

export const sendTestEmailSchema = z.object({
  newsletter_id: z.uuid(),
  to_email: z.string().email(),
});

export type SendTestEmailInput = z.infer<typeof sendTestEmailSchema>;

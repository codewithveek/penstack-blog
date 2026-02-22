/**
 * packages/core/src/validators/setup.ts
 *
 * Setup wizard input validation — platform first-boot and per-site onboarding.
 */

import { z } from "zod";

const passwordField = z
  .string()
  .min(8)
  .max(128)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/);

export const setupStep1AdminSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  password: passwordField,
});

export type SetupStep1AdminInput = z.infer<typeof setupStep1AdminSchema>;

export const setupStep2SiteSchema = z.object({
  site_name: z.string().min(1).max(255),
  site_slug: z
    .string()
    .min(1)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Site slug must be lowercase alphanumeric and hyphens only (used as subdomain)",
    }),
  site_description: z.string().max(2000).optional(),
  timezone: z.string().default("UTC"),
  locale: z.string().max(16).default("en"),
});

export type SetupStep2SiteInput = z.infer<typeof setupStep2SiteSchema>;

export const setupStep3EmailSchema = z.discriminatedUnion("service_type", [
  z.object({
    service_type: z.literal("none"),
  }),
  z.object({
    service_type: z.literal("smtp"),
    smtp_host: z.string().min(1).max(255),
    smtp_port: z.coerce.number().int().min(1).max(65535),
    smtp_user: z.string().min(1).max(255),
    smtp_password: z.string().min(1),
    smtp_secure: z.boolean().default(true),
    from_email: z.string().email().max(255),
    from_name: z.string().min(1).max(255),
  }),
  z.object({
    service_type: z.literal("resend"),
    api_key: z.string().min(1),
    from_email: z.string().email().max(255),
    from_name: z.string().min(1).max(255),
  }),
  z.object({
    service_type: z.literal("sendgrid"),
    api_key: z.string().min(1),
    from_email: z.string().email().max(255),
    from_name: z.string().min(1).max(255),
  }),
  z.object({
    service_type: z.literal("mailgun"),
    api_key: z.string().min(1),
    domain: z.string().min(1).max(255),
    from_email: z.string().email().max(255),
    from_name: z.string().min(1).max(255),
  }),
]);

export type SetupStep3EmailInput = z.infer<typeof setupStep3EmailSchema>;

export const setupCompleteSchema = z.object({
  admin: setupStep1AdminSchema,
  site: setupStep2SiteSchema,
  email: setupStep3EmailSchema.optional(),
});

export type SetupCompleteInput = z.infer<typeof setupCompleteSchema>;

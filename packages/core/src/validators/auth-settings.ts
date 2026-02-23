/**
 * packages/core/src/validators/auth-settings.ts
 *
 * Zod schemas for per-site auth configuration.
 */

import { z } from "zod";

export const updateAuthSettingsSchema = z.object({
  google_enabled: z.boolean().optional(),
  google_client_id: z.string().max(512).optional().nullable(),
  google_client_secret: z.string().max(512).optional().nullable(),
  facebook_enabled: z.boolean().optional(),
  facebook_app_id: z.string().max(512).optional().nullable(),
  facebook_app_secret: z.string().max(512).optional().nullable(),
  allow_social_for_admins: z.boolean().optional(),
  allow_social_for_members: z.boolean().optional(),
});

export type UpdateAuthSettingsInput = z.infer<typeof updateAuthSettingsSchema>;

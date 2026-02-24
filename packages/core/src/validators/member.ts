/**
 * packages/core/src/validators/member.ts
 */

import { z } from "zod";

export const createMemberSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(255).optional(),
  avatar: z.string().url().max(512).optional().nullable(),
  subscribed: z.boolean().default(true),
  note: z.string().max(2000).optional().nullable(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

export const updateMemberSchema = createMemberSchema.partial().extend({
  id: z.string().uuid().optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const listMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "banned"]).optional(),
  subscribed: z.coerce.boolean().optional(),
  search: z.string().max(255).optional(),
});

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

// Magic link request
export const magicLinkRequestSchema = z.object({
  email: z.string().email(),
  /** URL to redirect to after successful auth */
  redirect_to: z.string().url().optional(),
});

export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestSchema>;

// Magic link verify
export const magicLinkVerifySchema = z.object({
  token: z.string().min(1),
});

export type MagicLinkVerifyInput = z.infer<typeof magicLinkVerifySchema>;

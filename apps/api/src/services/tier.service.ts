/**
 * apps/api/src/services/tier.service.ts
 *
 * Membership tier management — CRUD for pricing tiers.
 * Uses the member repository's tier methods (tiers live in the members aggregate).
 */

import crypto from "node:crypto";
import type {
  IMemberRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import type { Tier } from "@cms/core/db/schema";
import { NotFoundError } from "@cms/core/errors";
import { generateSlug } from "@cms/core/utils/permalink";

export class TierService {
  constructor(private readonly memberRepo: IMemberRepository) {}

  async list(siteId: string): Promise<Tier[]> {
    return this.memberRepo.findTiers(siteId);
  }

  async create(
    siteId: string,
    input: {
      name: string;
      slug?: string;
      description?: string | null;
      monthly_price_cents?: number | null;
      yearly_price_cents?: number | null;
      currency?: string;
      benefits?: string[] | null;
      active?: boolean;
      trial_days?: number;
    }
  ): Promise<Tier> {
    const slug = input.slug ?? generateSlug(input.name);
    return this.memberRepo.createTier({
      id: crypto.randomUUID(),
      site_id: siteId,
      name: input.name,
      slug,
      description: input.description ?? null,
      monthly_price_cents: input.monthly_price_cents ?? null,
      yearly_price_cents: input.yearly_price_cents ?? null,
      currency: input.currency ?? "USD",
      benefits: input.benefits ? JSON.stringify(input.benefits) : null,
      active: input.active ?? true,
      trial_days: input.trial_days ?? 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}

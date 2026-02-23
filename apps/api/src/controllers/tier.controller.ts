/**
 * apps/api/src/controllers/tier.controller.ts
 */

import type { TierService } from "../services/tier.service";
import type { Tier } from "@cms/core/db/schema";

export class TierController {
  constructor(private readonly tierService: TierService) {}

  async list(siteId: string): Promise<Tier[]> {
    return this.tierService.list(siteId);
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
    return this.tierService.create(siteId, input);
  }
}

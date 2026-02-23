/**
 * apps/api/src/services/redirect.service.ts
 *
 * Redirect management. Handles creating, listing, and deleting URL
 * redirects for a site. Cache invalidation on writes.
 */

import type {
  IRedirectRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import type { Redirect } from "@cms/core/db/schema";
import { NotFoundError, ConflictError } from "@cms/core/errors";
import type { Cache } from "../lib/cache";

export class RedirectService {
  constructor(
    private readonly redirectRepo: IRedirectRepository,
    private readonly cache: Cache
  ) {}

  async list(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Redirect>> {
    return this.redirectRepo.findMany(siteId, pagination);
  }

  async create(
    siteId: string,
    input: { from_path: string; to_path: string; type: "301" | "302"; active: boolean }
  ): Promise<Redirect> {
    // Check for duplicate from_path
    const existing = await this.redirectRepo.findByFromPath(
      siteId,
      input.from_path
    );
    if (existing)
      throw new ConflictError(
        `A redirect from "${input.from_path}" already exists`
      );

    const redirect = await this.redirectRepo.create({
      site_id: siteId,
      from_path: input.from_path,
      to_path: input.to_path,
      type: input.type,
      active: input.active,
    });

    await this.cache.invalidate(`redirect:site:${siteId}`);
    return redirect;
  }

  async delete(siteId: string, id: string): Promise<void> {
    await this.redirectRepo.delete(siteId, id);
    await this.cache.invalidate(`redirect:site:${siteId}`);
  }
}

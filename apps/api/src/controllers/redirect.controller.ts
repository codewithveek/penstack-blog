/**
 * apps/api/src/controllers/redirect.controller.ts
 */

import type { RedirectService } from "../services/redirect.service";
import type { Redirect } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";

export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  async list(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Redirect>> {
    return this.redirectService.list(siteId, pagination);
  }

  async create(
    siteId: string,
    input: { from_path: string; to_path: string; type: "301" | "302"; active: boolean }
  ): Promise<Redirect> {
    return this.redirectService.create(siteId, input);
  }

  async delete(siteId: string, id: string): Promise<void> {
    return this.redirectService.delete(siteId, id);
  }
}

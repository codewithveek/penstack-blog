/**
 * apps/api/src/controllers/tag.controller.ts
 */

import type { TagService } from "../services/tag.service";
import type { Tag } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";

export class TagController {
  constructor(private readonly tagService: TagService) {}

  async list(
    siteId: string,
    pagination: PaginationParams & { search?: string }
  ): Promise<PaginatedResult<Tag>> {
    return this.tagService.listTags(siteId, pagination);
  }

  async getById(siteId: string, id: string): Promise<Tag> {
    return this.tagService.getById(siteId, id);
  }

  async getBySlug(siteId: string, slug: string): Promise<Tag> {
    return this.tagService.getBySlug(siteId, slug);
  }

  async create(
    siteId: string,
    input: {
      name: string;
      slug?: string;
      description?: string;
      featureImage?: string;
    }
  ): Promise<Tag> {
    return this.tagService.createTag(siteId, input);
  }

  async update(
    siteId: string,
    id: string,
    input: Partial<{
      name: string;
      slug: string;
      description: string | null;
      featureImage: string | null;
    }>
  ): Promise<Tag> {
    return this.tagService.updateTag(siteId, id, input);
  }

  async delete(siteId: string, id: string): Promise<void> {
    return this.tagService.deleteTag(siteId, id);
  }
}

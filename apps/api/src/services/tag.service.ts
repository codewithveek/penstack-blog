/**
 * apps/api/src/services/tag.service.ts
 */

import crypto from "node:crypto";
import type { ITagRepository } from "@cms/core/types/repositories";
import type { Tag, NewTag } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, ConflictError } from "@cms/core/errors";
import { generateSlug, appendSlugSuffix } from "@cms/core/utils/permalink";

export class TagService {
  constructor(private readonly tagRepo: ITagRepository) {}

  async getById(siteId: string, id: string): Promise<Tag> {
    const tag = await this.tagRepo.findById(siteId, id);
    if (!tag) throw new NotFoundError("Tag", id);
    return tag;
  }

  async getBySlug(siteId: string, slug: string): Promise<Tag> {
    const tag = await this.tagRepo.findBySlug(siteId, slug);
    if (!tag) throw new NotFoundError("Tag", slug);
    return tag;
  }

  async listTags(
    siteId: string,
    pagination: PaginationParams & { search?: string }
  ): Promise<PaginatedResult<Tag>> {
    return this.tagRepo.findMany(siteId, pagination);
  }

  async createTag(
    siteId: string,
    input: {
      name: string;
      slug?: string;
      description?: string;
      featureImage?: string;
    }
  ): Promise<Tag> {
    const baseSlug = input.slug ?? generateSlug(input.name);
    const slug = await this.ensureUniqueSlug(siteId, baseSlug);

    return this.tagRepo.create({
      id: crypto.randomUUID(),
      site_id: siteId,
      name: input.name,
      slug,
      description: input.description ?? null,
      feature_image: input.featureImage ?? null,
      visibility: "public",
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async updateTag(
    siteId: string,
    id: string,
    input: Partial<{
      name: string;
      slug: string;
      description: string | null;
      featureImage: string | null;
    }>
  ): Promise<Tag> {
    const tag = await this.tagRepo.findById(siteId, id);
    if (!tag) throw new NotFoundError("Tag", id);

    let slug = input.slug;
    if (slug && slug !== tag.slug) {
      slug = await this.ensureUniqueSlug(siteId, slug, id);
    }

    return this.tagRepo.update(siteId, id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(slug && { slug }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.featureImage !== undefined && {
        feature_image: input.featureImage,
      }),
    });
  }

  async deleteTag(siteId: string, id: string): Promise<void> {
    const tag = await this.tagRepo.findById(siteId, id);
    if (!tag) throw new NotFoundError("Tag", id);
    await this.tagRepo.delete(siteId, id);
  }

  private async ensureUniqueSlug(
    siteId: string,
    slug: string,
    excludeId?: string
  ): Promise<string> {
    let candidate = slug;
    let attempt = 0;
    while (true) {
      const existing = await this.tagRepo.findBySlug(siteId, candidate);
      if (!existing || existing.id === excludeId) return candidate;
      attempt++;
      candidate = appendSlugSuffix(slug, attempt);
    }
  }
}

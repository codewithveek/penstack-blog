/**
 * apps/api/src/services/site.service.ts
 *
 * Site management business logic.
 * Multi-tenancy rule: siteId always from session — services receive it as a parameter.
 */

import type { ISiteRepository } from "@cms/core/types/repositories";
import type { Site, NewSite } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, ConflictError } from "@cms/core/errors";
import type { Cache } from "../lib/cache";
import { TTL } from "../lib/cache";

export class SiteService {
  constructor(
    private readonly siteRepo: ISiteRepository,
    private readonly cache: Cache
  ) {}

  async getById(id: string): Promise<Site> {
    const site = await this.siteRepo.findById(id);
    if (!site) throw new NotFoundError("Site", id);
    return site;
  }

  async getByHost(hostname: string): Promise<Site | null> {
    const cacheKey = Cache.siteByHost(hostname);
    const cached = await this.cache.get<Site>(cacheKey);
    if (cached) return cached;

    // Try custom domain first, then subdomain
    const byDomain = await this.siteRepo.findByCustomDomain(hostname);
    if (byDomain) {
      await this.cache.set(cacheKey, byDomain, TTL.SITE_RESOLUTION);
      return byDomain;
    }

    // Extract subdomain from e.g. "mysite.platform.com"
    const platformDomain = process.env.PLATFORM_DOMAIN;
    if (platformDomain) {
      const subdomain = hostname.replace(`.${platformDomain}`, "");
      if (subdomain !== hostname) {
        const bySlug = await this.siteRepo.findBySlug(subdomain);
        if (bySlug) {
          await this.cache.set(cacheKey, bySlug, TTL.SITE_RESOLUTION);
          return bySlug;
        }
      }
    }

    return null;
  }

  async getAll(pagination: PaginationParams): Promise<PaginatedResult<Site>> {
    return this.siteRepo.findAll(pagination);
  }

  async create(data: Omit<NewSite, "id">): Promise<Site> {
    const existing = await this.siteRepo.findBySlug(data.slug);
    if (existing) throw new ConflictError("Site slug is already taken");

    const id = crypto.randomUUID();
    return this.siteRepo.create({ ...data, id } as NewSite);
  }

  async update(id: string, data: Partial<NewSite>): Promise<Site> {
    const site = await this.siteRepo.findById(id);
    if (!site) throw new NotFoundError("Site", id);

    if (data.slug && data.slug !== site.slug) {
      const conflict = await this.siteRepo.findBySlug(data.slug);
      if (conflict) throw new ConflictError("Site slug is already taken");
    }

    const updated = await this.siteRepo.update(id, data);

    // Invalidate all host cache entries this site may have been cached under
    await this.cache.invalidate(Cache.siteByHost(site.slug));
    if (site.custom_domain) {
      await this.cache.invalidate(Cache.siteByHost(site.custom_domain));
    }
    if (data.custom_domain) {
      await this.cache.invalidate(Cache.siteByHost(data.custom_domain));
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const site = await this.siteRepo.findById(id);
    if (!site) throw new NotFoundError("Site", id);
    await this.siteRepo.delete(id);
    await this.cache.invalidate(Cache.siteByHost(site.slug));
    if (site.custom_domain) {
      await this.cache.invalidate(Cache.siteByHost(site.custom_domain));
    }
  }

  async markSetupComplete(id: string): Promise<void> {
    const site = await this.siteRepo.findById(id);
    if (!site) throw new NotFoundError("Site", id);
    await this.siteRepo.markSetupComplete(id);
  }
}

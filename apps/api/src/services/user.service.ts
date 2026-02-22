/**
 * apps/api/src/services/user.service.ts
 *
 * Admin user management.
 */

import crypto from "node:crypto";
import type { IUserRepository } from "@cms/core/types/repositories";
import type { User, NewUser } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, ConflictError } from "@cms/core/errors";
import { generateSlug, appendSlugSuffix } from "@cms/core/utils/permalink";

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  async getById(siteId: string, id: string): Promise<User> {
    const user = await this.userRepo.findById(siteId, id);
    if (!user) throw new NotFoundError("User", id);
    return user;
  }

  async getByEmail(siteId: string, email: string): Promise<User | null> {
    return this.userRepo.findByEmail(siteId, email);
  }

  async listUsers(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<User>> {
    return this.userRepo.findMany(siteId, pagination);
  }

  async createUser(
    siteId: string,
    input: {
      email: string;
      name: string;
      role: User["role"];
      avatarUrl?: string;
      bio?: string;
      website?: string;
      twitter?: string;
    }
  ): Promise<User> {
    const existing = await this.userRepo.findByEmail(siteId, input.email);
    if (existing)
      throw new ConflictError("A user with this email already exists");

    const baseSlug = generateSlug(input.name);
    const slug = await this.ensureUniqueSlug(siteId, baseSlug);

    return this.userRepo.create({
      id: crypto.randomUUID(),
      site_id: siteId,
      email: input.email,
      name: input.name,
      slug,
      role: input.role,
      avatar_url: input.avatarUrl ?? null,
      bio: input.bio ?? null,
      website: input.website ?? null,
      twitter: input.twitter ?? null,
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async updateUser(
    siteId: string,
    id: string,
    input: Partial<{
      name: string;
      role: User["role"];
      avatarUrl: string | null;
      bio: string | null;
      website: string | null;
      twitter: string | null;
    }>
  ): Promise<User> {
    const user = await this.userRepo.findById(siteId, id);
    if (!user) throw new NotFoundError("User", id);

    return this.userRepo.update(siteId, id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.role !== undefined && { role: input.role }),
      ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.website !== undefined && { website: input.website }),
      ...(input.twitter !== undefined && { twitter: input.twitter }),
    });
  }

  async deleteUser(siteId: string, id: string): Promise<void> {
    const user = await this.userRepo.findById(siteId, id);
    if (!user) throw new NotFoundError("User", id);
    await this.userRepo.delete(siteId, id);
  }

  private async ensureUniqueSlug(
    siteId: string,
    slug: string
  ): Promise<string> {
    let candidate = slug;
    let attempt = 0;
    while (true) {
      const existing = await this.userRepo
        .findByEmail(siteId, candidate)
        .catch(() => null);
      if (!existing) return candidate;
      attempt++;
      candidate = appendSlugSuffix(slug, attempt);
    }
  }
}

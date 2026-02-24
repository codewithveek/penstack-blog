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

  async getBySlug(siteId: string, slug: string): Promise<User> {
    const user = await this.userRepo.findBySlug(siteId, slug);
    if (!user) throw new NotFoundError("User", slug);
    return user;
  }

  async getByEmail(siteId: string, email: string): Promise<User | null> {
    return this.userRepo.findByEmail(siteId, email);
  }

  async listUsers(
    siteId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<User>> {
    return this.userRepo.findAll(siteId, pagination);
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
      image: input.avatarUrl ?? null,
      bio: input.bio ?? null,
      website: input.website ?? null,
      twitter: input.twitter ?? null,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Create a user with a pre-hashed password. Used during setup to create
   * the admin user with credentials that Better Auth can verify on sign-in.
   */
  async createUserWithPassword(
    siteId: string,
    input: {
      email: string;
      name: string;
      role: User["role"];
      passwordHash: string;
    }
  ): Promise<User> {
    const baseSlug = generateSlug(input.name);
    const slug = await this.ensureUniqueSlug(siteId, baseSlug);

    const userId = crypto.randomUUID();

    const user = await this.userRepo.create({
      id: userId,
      site_id: siteId,
      email: input.email,
      name: input.name,
      password: input.passwordHash,
      slug,
      role: input.role,
      emailVerified: true,
      is_super_admin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create the "credential" account entry that Better Auth needs for
    // email/password sign-in to work. Without this row, Better Auth's
    // sign-in flow will reject the credentials.
    await this.userRepo.createCredentialAccount(userId, input.passwordHash);

    return user;
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
      ...(input.avatarUrl !== undefined && { image: input.avatarUrl }),
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

  /**
   * Update CMS-specific fields on a user record by id (no site_id scoping).
   * Used during setup to patch the Better Auth-created user with site_id, slug, role, etc.
   */
  async updateUserFieldsById(
    id: string,
    data: Partial<{
      site_id: string;
      slug: string;
      role: User["role"];
      emailVerified: boolean;
      is_super_admin: boolean;
    }>
  ): Promise<void> {
    await this.userRepo.updateById(id, data);
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

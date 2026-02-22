/**
 * apps/api/src/repositories/user.repository.ts
 *
 * Manages admin users, sessions, and accounts.
 * Implements IUserRepository.
 */

import { eq, and, sql, like } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import { users, sessions } from "@cms/core/db/schema";
import type { User, NewUser, Session } from "@cms/core/db/schema";
import type {
  IUserRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<User | null> {
    try {
      const rows = await this.db
        .select()
        .from(users)
        .where(and(eq(users.site_id, siteId), eq(users.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find user by id", "findById", err);
    }
  }

  async findByEmail(siteId: string, email: string): Promise<User | null> {
    try {
      const rows = await this.db
        .select()
        .from(users)
        .where(and(eq(users.site_id, siteId), eq(users.email, email)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find user by email",
        "findByEmail",
        err
      );
    }
  }

  async findBySlug(siteId: string, slug: string): Promise<User | null> {
    try {
      const rows = await this.db
        .select()
        .from(users)
        .where(and(eq(users.site_id, siteId), eq(users.slug, slug)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find user by slug",
        "findBySlug",
        err
      );
    }
  }

  async findAll(
    siteId: string,
    params: PaginationParams & { role?: string }
  ): Promise<PaginatedResult<User>> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [eq(users.site_id, siteId)];
    if (params.role) conditions.push(eq(users.role, params.role as typeof users.role._.data));

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(users)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(...conditions)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list users", "findAll", err);
    }
  }

  async findSuperAdmin(email: string): Promise<User | null> {
    try {
      const rows = await this.db
        .select()
        .from(users)
        .where(
          and(eq(users.email, email), eq(users.is_super_admin, true))
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find super admin",
        "findSuperAdmin",
        err
      );
    }
  }

  async create(data: NewUser): Promise<User> {
    try {
      await this.db.insert(users).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError("User not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create user", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewUser>
  ): Promise<User> {
    try {
      await this.db
        .update(users)
        .set(data)
        .where(and(eq(users.site_id, siteId), eq(users.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("User", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update user", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(users)
        .where(and(eq(users.site_id, siteId), eq(users.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete user", "delete", err);
    }
  }

  // ─── Session management ─────────────────────────────────────────────────────

  async createSession(data: typeof sessions.$inferInsert): Promise<Session> {
    try {
      await this.db.insert(sessions).values(data);
      const rows = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.id, data.id))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError(
          "Session not found after insert",
          "createSession"
        );
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create session",
        "createSession",
        err
      );
    }
  }

  async findSession(token: string): Promise<Session | null> {
    try {
      const rows = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find session", "findSession", err);
    }
  }

  async deleteSession(token: string): Promise<void> {
    try {
      await this.db.delete(sessions).where(eq(sessions.token, token));
    } catch (err) {
      throw new RepositoryError(
        "Failed to delete session",
        "deleteSession",
        err
      );
    }
  }

  async deleteExpiredSessions(siteId: string, userId: string): Promise<void> {
    try {
      await this.db
        .delete(sessions)
        .where(
          and(eq(sessions.user_id, userId), sql`${sessions.expires_at} < NOW()`)
        );
    } catch (err) {
      throw new RepositoryError(
        "Failed to delete expired sessions",
        "deleteExpiredSessions",
        err
      );
    }
  }
}

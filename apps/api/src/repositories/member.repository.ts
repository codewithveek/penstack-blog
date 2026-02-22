/**
 * apps/api/src/repositories/member.repository.ts
 *
 * Members, auth tokens, sessions, tiers, and subscriptions.
 * Implements IMemberRepository.
 */

import { eq, and, sql, gt, desc, asc, isNull, lt } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import {
  members,
  memberAuthTokens,
  memberSessions,
  memberNewsletters,
  tiers,
  subscriptions,
} from "@cms/core/db/schema";
import type {
  Member,
  NewMember,
  MemberAuthToken,
  NewMemberAuthToken,
  MemberSession,
  Tier,
  NewTier,
  Subscription,
} from "@cms/core/db/schema";
import type {
  IMemberRepository,
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class MemberRepository implements IMemberRepository {
  constructor(private readonly db: DB) {}

  async findById(siteId: string, id: string): Promise<Member | null> {
    try {
      const rows = await this.db
        .select()
        .from(members)
        .where(and(eq(members.site_id, siteId), eq(members.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError("Failed to find member by id", "findById", err);
    }
  }

  async findByEmail(siteId: string, email: string): Promise<Member | null> {
    try {
      const rows = await this.db
        .select()
        .from(members)
        .where(and(eq(members.site_id, siteId), eq(members.email, email)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find member by email",
        "findByEmail",
        err
      );
    }
  }

  async findMany(
    siteId: string,
    pagination: PaginationParams & {
      search?: string;
      status?: Member["status"];
    }
  ): Promise<PaginatedResult<Member>> {
    const page = pagination.page ?? 1;
    const limit = Math.min(pagination.limit ?? 15, 100);
    const offset = (page - 1) * limit;

    const conditions = [eq(members.site_id, siteId)];
    if (pagination.status)
      conditions.push(eq(members.status, pagination.status));
    if (pagination.search) {
      conditions.push(
        sql`(${members.name} LIKE ${"%" + pagination.search + "%"} OR ${members.email} LIKE ${"%" + pagination.search + "%"})`
      );
    }

    try {
      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(members)
          .where(and(...conditions))
          .orderBy(desc(members.created_at))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(members)
          .where(and(...conditions)),
      ]);

      const total = countRow?.count ?? 0;
      return {
        data: rows,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list members", "findMany", err);
    }
  }

  async create(data: NewMember): Promise<Member> {
    try {
      await this.db.insert(members).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError("Member not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create member", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewMember>
  ): Promise<Member> {
    try {
      await this.db
        .update(members)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(members.site_id, siteId), eq(members.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Member", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update member", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      await this.db
        .delete(members)
        .where(and(eq(members.site_id, siteId), eq(members.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete member", "delete", err);
    }
  }

  // ─── Auth tokens ──────────────────────────────────────────────────────────────

  async createAuthToken(
    memberId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<MemberAuthToken> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(memberAuthTokens).values({
        id,
        member_id: memberId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date(),
      });
      const rows = await this.db
        .select()
        .from(memberAuthTokens)
        .where(eq(memberAuthTokens.id, id))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError(
          "AuthToken not found after insert",
          "createAuthToken"
        );
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create auth token",
        "createAuthToken",
        err
      );
    }
  }

  async findValidAuthToken(tokenHash: string): Promise<MemberAuthToken | null> {
    try {
      const rows = await this.db
        .select()
        .from(memberAuthTokens)
        .where(
          and(
            eq(memberAuthTokens.token_hash, tokenHash),
            isNull(memberAuthTokens.used_at),
            gt(memberAuthTokens.expires_at, new Date())
          )
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find valid auth token",
        "findValidAuthToken",
        err
      );
    }
  }

  async markAuthTokenUsed(id: string): Promise<void> {
    try {
      await this.db
        .update(memberAuthTokens)
        .set({ used_at: new Date() })
        .where(eq(memberAuthTokens.id, id));
    } catch (err) {
      throw new RepositoryError(
        "Failed to mark auth token used",
        "markAuthTokenUsed",
        err
      );
    }
  }

  async deleteExpiredTokens(): Promise<void> {
    try {
      await this.db
        .delete(memberAuthTokens)
        .where(lt(memberAuthTokens.expires_at, new Date()));
    } catch (err) {
      throw new RepositoryError(
        "Failed to delete expired tokens",
        "deleteExpiredTokens",
        err
      );
    }
  }

  async upsertMemberNewsletterSubscription(
    memberId: string,
    newsletterId: string,
    subscribed: boolean
  ): Promise<void> {
    try {
      if (subscribed) {
        await this.db
          .insert(memberNewsletters)
          .values({
            member_id: memberId,
            newsletter_id: newsletterId,
            subscribed_at: new Date(),
          })
          .onDuplicateKeyUpdate({ set: { subscribed_at: new Date() } });
      } else {
        await this.db
          .delete(memberNewsletters)
          .where(
            and(
              eq(memberNewsletters.member_id, memberId),
              eq(memberNewsletters.newsletter_id, newsletterId)
            )
          );
      }
    } catch (err) {
      throw new RepositoryError(
        "Failed to upsert member newsletter subscription",
        "upsertMemberNewsletterSubscription",
        err
      );
    }
  }

  async getMemberNewsletterSubscriptions(memberId: string): Promise<string[]> {
    try {
      const rows = await this.db
        .select({ newsletter_id: memberNewsletters.newsletter_id })
        .from(memberNewsletters)
        .where(eq(memberNewsletters.member_id, memberId));
      return rows.map((r) => r.newsletter_id);
    } catch (err) {
      throw new RepositoryError(
        "Failed to get member newsletter subscriptions",
        "getMemberNewsletterSubscriptions",
        err
      );
    }
  }  // ─── Member sessions ─────────────────────────────────────────────────────────

  async createMemberSession(
    memberId: string,
    sessionToken: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ id: string; session_token: string; expires_at: Date }> {
    const id = crypto.randomUUID();
    try {
      await this.db.insert(memberSessions).values({
        id,
        member_id: memberId,
        token: sessionToken,
        expires_at: expiresAt,
        ip_address: ipAddress ?? null,
        user_agent: userAgent ?? null,
        created_at: new Date(),
      });
      return { id, session_token: sessionToken, expires_at: expiresAt };
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create member session",
        "createMemberSession",
        err
      );
    }
  }

  async findMemberSession(
    token: string
  ): Promise<{ id: string; member_id: string; expires_at: Date } | null> {
    try {
      const rows = await this.db
        .select()
        .from(memberSessions)
        .where(
          and(
            eq(memberSessions.token, token),
            gt(memberSessions.expires_at, new Date())
          )
        )
        .limit(1);
      if (!rows[0]) return null;
      return {
        id: rows[0].id,
        member_id: rows[0].member_id,
        expires_at: rows[0].expires_at,
      };
    } catch (err) {
      throw new RepositoryError(
        "Failed to find member session",
        "findMemberSession",
        err
      );
    }
  }

  async deleteMemberSession(token: string): Promise<void> {
    try {
      await this.db
        .delete(memberSessions)
        .where(eq(memberSessions.token, token));
    } catch (err) {
      throw new RepositoryError(
        "Failed to delete member session",
        "deleteMemberSession",
        err
      );
    }
  }

  // ─── Tiers ────────────────────────────────────────────────────────────────────

  async findTiers(siteId: string): Promise<Tier[]> {
    try {
      return this.db
        .select()
        .from(tiers)
        .where(and(eq(tiers.site_id, siteId), eq(tiers.active, true)))
        .orderBy(asc(tiers.monthly_price_cents));
    } catch (err) {
      throw new RepositoryError("Failed to list tiers", "findTiers", err);
    }
  }

  async createTier(data: NewTier): Promise<Tier> {
    try {
      await this.db.insert(tiers).values(data);
      const rows = await this.db
        .select()
        .from(tiers)
        .where(eq(tiers.id, data.id!))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError("Tier not found after insert", "createTier");
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create tier", "createTier", err);
    }
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────────

  async findSubscriptionByProviderId(
    providerSubscriptionId: string
  ): Promise<Subscription | null> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptions)
        .where(
          eq(subscriptions.provider_subscription_id, providerSubscriptionId)
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find subscription by provider id",
        "findSubscriptionByProviderId",
        err
      );
    }
  }

  async createSubscription(
    data: Omit<Subscription, "id" | "created_at" | "updated_at">
  ): Promise<Subscription> {
    const id = crypto.randomUUID();
    const now = new Date();
    try {
      await this.db.insert(subscriptions).values({ ...data, id, created_at: now, updated_at: now });
      const rows = await this.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, id))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError(
          "Subscription not found after insert",
          "createSubscription"
        );
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create subscription",
        "createSubscription",
        err
      );
    }
  }

  async updateSubscription(
    id: string,
    data: Partial<Omit<Subscription, "id" | "site_id" | "created_at">>
  ): Promise<Subscription> {
    try {
      await this.db
        .update(subscriptions)
        .set({ ...data, updated_at: new Date() })
        .where(eq(subscriptions.id, id));

      const rows = await this.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, id))
        .limit(1);
      if (!rows[0]) throw new NotFoundError("Subscription", id);
      return rows[0];
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError(
        "Failed to update subscription",
        "updateSubscription",
        err
      );
    }
  }
}

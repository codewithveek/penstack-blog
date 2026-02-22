/**
 * apps/api/src/repositories/member.repository.ts
 *
 * Members, auth tokens, sessions, tiers, and subscriptions.
 * Implements IMemberRepository.
 */

import { eq, and, sql, gt, desc, asc, isNull, like } from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import {
  members,
  memberAuthTokens,
  memberSessions,
  tiers,
  subscriptions,
} from "@cms/core/db/schema";
import type {
  Member,
  NewMember,
  MemberAuthToken,
  NewMemberAuthToken,
  MemberSession,
  NewMemberSession,
  Tier,
  NewTier,
  Subscription,
  NewSubscription,
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

  async findByStripeCustomer(
    siteId: string,
    stripeCustomerId: string
  ): Promise<Member | null> {
    try {
      const rows = await this.db
        .select()
        .from(members)
        .where(
          and(
            eq(members.site_id, siteId),
            eq(members.stripe_customer_id, stripeCustomerId)
          )
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find member by stripe customer",
        "findByStripeCustomer",
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

  async createAuthToken(data: NewMemberAuthToken): Promise<MemberAuthToken> {
    try {
      await this.db.insert(memberAuthTokens).values(data);
      const rows = await this.db
        .select()
        .from(memberAuthTokens)
        .where(eq(memberAuthTokens.id, data.id))
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

  async findValidAuthToken(
    siteId: string,
    tokenHash: string
  ): Promise<MemberAuthToken | null> {
    try {
      const rows = await this.db
        .select()
        .from(memberAuthTokens)
        .where(
          and(
            eq(memberAuthTokens.site_id, siteId),
            eq(memberAuthTokens.token_hash, tokenHash),
            eq(memberAuthTokens.used, false),
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
        .set({ used: true })
        .where(eq(memberAuthTokens.id, id));
    } catch (err) {
      throw new RepositoryError(
        "Failed to mark auth token used",
        "markAuthTokenUsed",
        err
      );
    }
  }

  // ─── Member sessions ─────────────────────────────────────────────────────────

  async createMemberSession(data: NewMemberSession): Promise<MemberSession> {
    try {
      await this.db.insert(memberSessions).values(data);
      const rows = await this.db
        .select()
        .from(memberSessions)
        .where(eq(memberSessions.id, data.id))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError(
          "MemberSession not found after insert",
          "createMemberSession"
        );
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to create member session",
        "createMemberSession",
        err
      );
    }
  }

  async findMemberSession(token: string): Promise<MemberSession | null> {
    try {
      const rows = await this.db
        .select()
        .from(memberSessions)
        .where(
          and(
            eq(memberSessions.session_token, token),
            gt(memberSessions.expires_at, new Date())
          )
        )
        .limit(1);
      return rows[0] ?? null;
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
        .where(eq(memberSessions.session_token, token));
    } catch (err) {
      throw new RepositoryError(
        "Failed to delete member session",
        "deleteMemberSession",
        err
      );
    }
  }

  // ─── Tiers ────────────────────────────────────────────────────────────────────

  async findTierById(siteId: string, id: string): Promise<Tier | null> {
    try {
      const rows = await this.db
        .select()
        .from(tiers)
        .where(and(eq(tiers.site_id, siteId), eq(tiers.id, id)))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find tier by id",
        "findTierById",
        err
      );
    }
  }

  async findTiers(siteId: string): Promise<Tier[]> {
    try {
      return this.db
        .select()
        .from(tiers)
        .where(and(eq(tiers.site_id, siteId), eq(tiers.active, true)))
        .orderBy(asc(tiers.monthly_price));
    } catch (err) {
      throw new RepositoryError("Failed to list tiers", "findTiers", err);
    }
  }

  async createTier(data: NewTier): Promise<Tier> {
    try {
      await this.db.insert(tiers).values(data);
      const created = await this.findTierById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError("Tier not found after insert", "createTier");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create tier", "createTier", err);
    }
  }

  async updateTier(
    siteId: string,
    id: string,
    data: Partial<NewTier>
  ): Promise<Tier> {
    try {
      await this.db
        .update(tiers)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(tiers.site_id, siteId), eq(tiers.id, id)));

      const updated = await this.findTierById(siteId, id);
      if (!updated) throw new NotFoundError("Tier", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update tier", "updateTier", err);
    }
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────────

  async findSubscriptionByMember(
    siteId: string,
    memberId: string
  ): Promise<Subscription | null> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.site_id, siteId),
            eq(subscriptions.member_id, memberId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find subscription by member",
        "findSubscriptionByMember",
        err
      );
    }
  }

  async findSubscriptionByStripeId(
    stripeSubscriptionId: string
  ): Promise<Subscription | null> {
    try {
      const rows = await this.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripe_subscription_id, stripeSubscriptionId))
        .limit(1);
      return rows[0] ?? null;
    } catch (err) {
      throw new RepositoryError(
        "Failed to find subscription by stripe id",
        "findSubscriptionByStripeId",
        err
      );
    }
  }

  async createSubscription(data: NewSubscription): Promise<Subscription> {
    try {
      await this.db.insert(subscriptions).values(data);
      const rows = await this.db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, data.id))
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
    data: Partial<NewSubscription>
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

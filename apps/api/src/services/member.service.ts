/**
 * apps/api/src/services/member.service.ts
 *
 * Member management and magic link authentication.
 */

import crypto from "node:crypto";
import type { IMemberRepository } from "@cms/core/types/repositories";
import type {
  IEmailProvider,
  IPaymentProvider,
} from "@cms/core/types/providers";
import type {
  Member,
  NewMember,
  Tier,
  Subscription,
} from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import {
  NotFoundError,
  ConflictError,
  UnauthenticatedError,
  ValidationError,
  ForbiddenError,
} from "@cms/core/errors";

const MAGIC_LINK_EXPIRY_MINUTES = 15;

export class MemberService {
  constructor(
    private readonly memberRepo: IMemberRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly paymentProvider: IPaymentProvider
  ) {}

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  async sendMagicLink(
    siteId: string,
    email: string,
    redirectUrl: string,
    siteUrl: string,
    siteName: string
  ): Promise<void> {
    // Find or create the member
    let member = await this.memberRepo.findByEmail(siteId, email);
    if (!member) {
      member = await this.memberRepo.create({
        id: crypto.randomUUID(),
        site_id: siteId,
        email,
        name: email.split("@")[0] ?? email,
        status: "active",
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Generate raw token and store its SHA-256 hash (never store raw)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(
      Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000
    );

    await this.memberRepo.createAuthToken(member.id, tokenHash, expiresAt);

    const magicLinkUrl = `${siteUrl}/members/auth?token=${rawToken}&redirect=${encodeURIComponent(redirectUrl)}`;

    await this.emailProvider.send({
      from: { email: `noreply@${new URL(siteUrl).hostname}`, name: siteName },
      to: { email },
      subject: `Sign in to ${siteName}`,
      html: `
        <p>Click the link below to sign in to ${siteName}. This link expires in ${MAGIC_LINK_EXPIRY_MINUTES} minutes.</p>
        <p><a href="${magicLinkUrl}">Sign in to ${siteName}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
      text: `Sign in to ${siteName}: ${magicLinkUrl}\n\nThis link expires in ${MAGIC_LINK_EXPIRY_MINUTES} minutes.`,
    });
  }

  async verifyMagicLink(
    siteId: string,
    rawToken: string
  ): Promise<{ member: Member; sessionToken: string }> {
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const authToken = await this.memberRepo.findValidAuthToken(tokenHash);

    if (!authToken) {
      throw new UnauthenticatedError("Invalid or expired magic link");
    }

    // Mark token as used (single-use)
    await this.memberRepo.markAuthTokenUsed(authToken.id);

    const member = await this.memberRepo.findById(siteId, authToken.member_id);
    if (!member) throw new NotFoundError("Member", authToken.member_id);

    // Create member session
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.memberRepo.createMemberSession(
      member.id,
      sessionToken,
      expiresAt
    );

    return { member, sessionToken };
  }

  async logout(sessionToken: string): Promise<void> {
    await this.memberRepo.deleteMemberSession(sessionToken);
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────────

  async getById(siteId: string, id: string): Promise<Member> {
    const member = await this.memberRepo.findById(siteId, id);
    if (!member) throw new NotFoundError("Member", id);
    return member;
  }

  async listMembers(
    siteId: string,
    pagination: PaginationParams & {
      search?: string;
      status?: Member["status"];
    }
  ): Promise<PaginatedResult<Member>> {
    return this.memberRepo.findMany(siteId, pagination);
  }

  async updateMember(
    siteId: string,
    id: string,
    data: Partial<Pick<NewMember, "name" | "note" | "avatar" | "subscribed">>
  ): Promise<Member> {
    const member = await this.memberRepo.findById(siteId, id);
    if (!member) throw new NotFoundError("Member", id);
    return this.memberRepo.update(siteId, id, data);
  }

  async deleteMember(siteId: string, id: string): Promise<void> {
    const member = await this.memberRepo.findById(siteId, id);
    if (!member) throw new NotFoundError("Member", id);
    await this.memberRepo.delete(siteId, id);
  }

  // ─── Tiers ────────────────────────────────────────────────────────────────────

  async getTiers(siteId: string): Promise<Tier[]> {
    return this.memberRepo.findTiers(siteId);
  }

  async createTier(
    siteId: string,
    data: {
      name: string;
      description?: string;
      monthlyPrice: number;
      yearlyPrice: number;
      currency: string;
      stripePriceIdMonthly: string;
      stripePriceIdYearly: string;
    }
  ): Promise<Tier> {
    return this.memberRepo.createTier({
      id: crypto.randomUUID(),
      site_id: siteId,
      name: data.name,
      description: data.description ?? null,
      monthly_price_cents: data.monthlyPrice,
      yearly_price_cents: data.yearlyPrice,
      currency: data.currency,
      stripe_monthly_price_id: data.stripePriceIdMonthly,
      stripe_yearly_price_id: data.stripePriceIdYearly,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────────

  async createCheckoutSession(
    siteId: string,
    memberId: string,
    tierId: string,
    interval: "monthly" | "yearly",
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string }> {
    const member = await this.memberRepo.findById(siteId, memberId);
    if (!member) throw new NotFoundError("Member", memberId);

    const tierList = await this.memberRepo.findTiers(siteId);
    const tier = tierList.find((t) => t.id === tierId);
    if (!tier) throw new NotFoundError("Tier", tierId);

    const priceId =
      interval === "monthly"
        ? tier.stripe_monthly_price_id
        : tier.stripe_yearly_price_id;
    if (!priceId)
      throw new ValidationError("Tier does not have a price configured for this interval");

    const session = await this.paymentProvider.createCheckoutSession({
      siteId,
      memberId,
      memberEmail: member.email,
      tierId,
      tierName: tier.name,
      priceId,
      successUrl,
      cancelUrl,
    });

    return { url: session.url };
  }

  async handlePaymentEvent(
    siteId: string,
    rawBody: string,
    signature: string
  ): Promise<void> {
    const event = await this.paymentProvider.parseWebhookPayload(
      rawBody,
      signature
    );

    switch (event.type) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = await this.memberRepo.findSubscriptionByProviderId(
          event.providerSubscriptionId
        );
        if (sub) {
          await this.memberRepo.updateSubscription(sub.id, {
            status: event.status as Subscription["status"],
            current_period_end: event.currentPeriodEnd ?? null,
            cancel_at_period_end: event.cancelAtPeriodEnd ?? false,
          });
        }
        break;
      }
      case "subscription.deleted": {
        const sub = await this.memberRepo.findSubscriptionByProviderId(
          event.providerSubscriptionId
        );
        if (sub) {
          await this.memberRepo.updateSubscription(sub.id, {
            status: "canceled",
            canceled_at: new Date(),
          });
          await this.memberRepo.update(siteId, sub.member_id, {
            status: "inactive",
          });
        }
        break;
      }
    }
  }

}

/**
 * apps/api/src/controllers/member.controller.ts
 */

import type { MemberService } from "../services/member.service"
import type { Member, Tier } from "@cms/core/db/schema"
import type { PaginatedResult, PaginationParams } from "@cms/core/types/repositories"

export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  async sendMagicLink(siteId: string, email: string, redirectUrl: string, siteUrl: string, siteName: string): Promise<void> {
    return this.memberService.sendMagicLink(siteId, email, redirectUrl, siteUrl, siteName)
  }

  async verifyMagicLink(siteId: string, token: string): Promise<{ member: Member; sessionToken: string }> {
    return this.memberService.verifyMagicLink(siteId, token)
  }

  async logout(sessionToken: string): Promise<void> {
    return this.memberService.logout(sessionToken)
  }

  async getById(siteId: string, id: string): Promise<Member> {
    return this.memberService.getById(siteId, id)
  }

  async list(siteId: string, pagination: PaginationParams & { search?: string; status?: Member["status"] }): Promise<PaginatedResult<Member>> {
    return this.memberService.listMembers(siteId, pagination)
  }

  async update(siteId: string, id: string, data: Partial<Pick<Member, "name" | "bio" | "avatar_url" | "subscribed_to_emails">>): Promise<Member> {
    return this.memberService.updateMember(siteId, id, data)
  }

  async delete(siteId: string, id: string): Promise<void> {
    return this.memberService.deleteMember(siteId, id)
  }

  async getTiers(siteId: string): Promise<Tier[]> {
    return this.memberService.getTiers(siteId)
  }

  async createCheckoutSession(siteId: string, memberId: string, priceId: string, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
    return this.memberService.createCheckoutSession(siteId, memberId, priceId, successUrl, cancelUrl)
  }

  async handlePaymentWebhook(siteId: string, rawBody: string, signature: string): Promise<void> {
    return this.memberService.handlePaymentEvent(siteId, rawBody, signature)
  }
}

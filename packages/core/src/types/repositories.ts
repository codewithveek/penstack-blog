/**
 * packages/core/src/types/repositories.ts
 *
 * Interface-driven repository contracts.
 * Services depend ONLY on these interfaces.
 * Implementations live in apps/api/src/repositories/.
 *
 * PRD §6.2: "Services depend on the interface, not the concrete class."
 */

import type {
  Site,
  NewSite,
  User,
  NewUser,
  Post,
  NewPost,
  Tag,
  NewTag,
  Member,
  NewMember,
  MemberAuthToken,
  Tier,
  NewTier,
  Subscription,
  Newsletter,
  EmailSend,
  EmailSendRecipient,
  ApiKey,
  Webhook,
  WebhookDelivery,
  Redirect,
  SiteAuthSettings,
  PlatformSetting,
  SiteSetting,
  MediaAsset,
  NewMediaAsset,
  PostAuthor,
} from "../db/schema/index.js";

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Post author DTO (for writes)
// ---------------------------------------------------------------------------

export interface PostAuthorInput {
  user_id: string;
  role: "primary" | "co_author" | "contributor";
  sort_order: number;
}

// ---------------------------------------------------------------------------
// Site repository
// ---------------------------------------------------------------------------

export interface ISiteRepository {
  findById(id: string): Promise<Site | null>;
  findBySlug(slug: string): Promise<Site | null>;
  findByCustomDomain(domain: string): Promise<Site | null>;
  findAll(pagination: PaginationParams): Promise<PaginatedResult<Site>>;
  create(data: NewSite): Promise<Site>;
  update(id: string, data: Partial<NewSite>): Promise<Site>;
  delete(id: string): Promise<void>;
  markSetupComplete(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// User repository
// ---------------------------------------------------------------------------

export interface IUserRepository {
  findById(siteId: string, id: string): Promise<User | null>;
  findByEmail(siteId: string, email: string): Promise<User | null>;
  findBySlug(siteId: string, slug: string): Promise<User | null>;
  findAll(
    siteId: string,
    params: PaginationParams & { role?: string }
  ): Promise<PaginatedResult<User>>;
  create(data: NewUser): Promise<User>;
  update(siteId: string, id: string, data: Partial<NewUser>): Promise<User>;
  delete(siteId: string, id: string): Promise<void>;
  /** Find super_admin user (crosses site boundaries) */
  findSuperAdmin(email: string): Promise<User | null>;
}

// ---------------------------------------------------------------------------
// Post repository
// ---------------------------------------------------------------------------

export interface PostFindManyParams extends PaginationParams {
  status?: "draft" | "published" | "scheduled" | "archived";
  type?: "post" | "page";
  visibility?: "public" | "members" | "paid";
  authorId?: string;
  tagSlug?: string;
  search?: string;
  sortBy?: "published_at" | "updated_at" | "created_at";
  sortOrder?: "asc" | "desc";
}

export interface PostWithAuthorsAndTags extends Post {
  authors: Array<{ user: User; role: string; sort_order: number }>;
  tags: Tag[];
}

export interface IPostRepository {
  findById(siteId: string, id: string): Promise<PostWithAuthorsAndTags | null>;
  findBySlug(
    siteId: string,
    slug: string
  ): Promise<PostWithAuthorsAndTags | null>;
  findByPermalink(
    siteId: string,
    permalink: string
  ): Promise<PostWithAuthorsAndTags | null>;
  findMany(
    siteId: string,
    params: PostFindManyParams
  ): Promise<PaginatedResult<PostWithAuthorsAndTags>>;
  create(data: NewPost): Promise<Post>;
  update(siteId: string, id: string, data: Partial<NewPost>): Promise<Post>;
  delete(siteId: string, id: string): Promise<void>;
  publish(siteId: string, id: string, permalink: string): Promise<Post>;
  /**
   * Replace the full author list for a post.
   * At least one author with role='primary' must be in the list.
   */
  setAuthors(postId: string, authors: PostAuthorInput[]): Promise<void>;
  setTags(siteId: string, postId: string, tagIds: string[]): Promise<void>;
  findScheduledReady(now: Date): Promise<Post[]>;
  updateAllPermalinks(
    siteId: string,
    updates: Array<{ id: string; oldPermalink: string; newPermalink: string }>
  ): Promise<void>;
}

// ---------------------------------------------------------------------------
// Tag repository
// ---------------------------------------------------------------------------

export interface ITagRepository {
  findById(siteId: string, id: string): Promise<Tag | null>;
  findBySlug(siteId: string, slug: string): Promise<Tag | null>;
  findMany(
    siteId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Tag>>;
  findByPost(postId: string): Promise<Tag[]>;
  create(data: NewTag): Promise<Tag>;
  update(siteId: string, id: string, data: Partial<NewTag>): Promise<Tag>;
  delete(siteId: string, id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Member repository
// ---------------------------------------------------------------------------

export interface IMemberRepository {
  findById(siteId: string, id: string): Promise<Member | null>;
  findByEmail(siteId: string, email: string): Promise<Member | null>;
  findMany(
    siteId: string,
    params: PaginationParams & { status?: string; subscribed?: boolean }
  ): Promise<PaginatedResult<Member>>;
  create(data: NewMember): Promise<Member>;
  update(siteId: string, id: string, data: Partial<NewMember>): Promise<Member>;
  delete(siteId: string, id: string): Promise<void>;
  createAuthToken(
    memberId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<MemberAuthToken>;
  findValidAuthToken(tokenHash: string): Promise<MemberAuthToken | null>;
  markAuthTokenUsed(id: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
  upsertMemberNewsletterSubscription(
    memberId: string,
    newsletterId: string,
    subscribed: boolean
  ): Promise<void>;
  getMemberNewsletterSubscriptions(memberId: string): Promise<string[]>;
  /** Create a new HTTP-only member session (7-day TTL). */
  createMemberSession(
    memberId: string,
    sessionToken: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ id: string; session_token: string; expires_at: Date }>;
  /** Find a session by its raw token. Returns null if expired or not found. */
  findMemberSession(
    token: string
  ): Promise<{ id: string; member_id: string; expires_at: Date } | null>;
  /** Delete a session (logout). */
  deleteMemberSession(token: string): Promise<void>;
  /** List all active tiers for a site. */
  findTiers(siteId: string): Promise<Tier[]>;
  /** Create a membership tier. */
  createTier(data: NewTier): Promise<Tier>;
  /** Find a subscription by its provider subscription ID (e.g. Stripe sub ID). */
  findSubscriptionByProviderId(
    providerSubscriptionId: string
  ): Promise<Subscription | null>;
  /** Update a subscription record. */
  updateSubscription(
    id: string,
    data: Partial<Omit<Subscription, "id" | "site_id" | "created_at">>
  ): Promise<Subscription>;
  /** Create a new subscription record. */
  createSubscription(
    data: Omit<Subscription, "id" | "created_at" | "updated_at">
  ): Promise<Subscription>;
}

// ---------------------------------------------------------------------------
// Newsletter repository
// ---------------------------------------------------------------------------

export interface INewsletterRepository {
  findById(siteId: string, id: string): Promise<Newsletter | null>;
  findBySlug(siteId: string, slug: string): Promise<Newsletter | null>;
  findMany(
    siteId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Newsletter>>;
  create(
    data: Omit<Newsletter, "id" | "created_at" | "updated_at">
  ): Promise<Newsletter>;
  update(
    siteId: string,
    id: string,
    data: Partial<Newsletter>
  ): Promise<Newsletter>;
  delete(siteId: string, id: string): Promise<void>;
  createEmailSend(
    data: Omit<EmailSend, "id" | "created_at" | "updated_at">
  ): Promise<EmailSend>;
  getEmailSend(id: string): Promise<EmailSend | null>;
  updateEmailSend(id: string, data: Partial<EmailSend>): Promise<EmailSend>;
  createEmailSendRecipient(
    sendId: string,
    memberId: string,
    trackingId: string
  ): Promise<EmailSendRecipient>;
  getNewsletterSubscriberEmails(newsletterId: string): Promise<string[]>;
  getNewsletterSubscriberCount(newsletterId: string): Promise<number>;
}

// ---------------------------------------------------------------------------
// Media repository
// ---------------------------------------------------------------------------

export interface IMediaRepository {
  findById(siteId: string, id: string): Promise<MediaAsset | null>;
  findMany(
    siteId: string,
    params: PaginationParams & {
      type?: string;
      folder?: string;
      search?: string;
    }
  ): Promise<PaginatedResult<MediaAsset>>;
  create(data: NewMediaAsset): Promise<MediaAsset>;
  update(
    siteId: string,
    id: string,
    data: Partial<NewMediaAsset>
  ): Promise<MediaAsset>;
  delete(siteId: string, id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Settings repository
// ---------------------------------------------------------------------------

export interface ISettingsRepository {
  getPlatformSetting(key: string): Promise<string | null>;
  setPlatformSetting(key: string, value: string): Promise<void>;
  getAllPlatformSettings(): Promise<Record<string, string>>;
  getSiteSetting(siteId: string, key: string): Promise<string | null>;
  setSiteSetting(siteId: string, key: string, value: string): Promise<void>;
  getAllSiteSettings(siteId: string): Promise<Record<string, string>>;
  deleteSiteSetting(siteId: string, key: string): Promise<void>;
  getPlatformSetupStatus(): Promise<{
    is_completed: boolean;
    completed_at: Date | null;
  }>;
  markPlatformSetupComplete(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Webhook repository
// ---------------------------------------------------------------------------

export interface IWebhookRepository {
  findById(siteId: string, id: string): Promise<Webhook | null>;
  findMany(
    siteId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Webhook>>;
  findBySiteId(siteId: string): Promise<Webhook[]>;
  findByEvent(siteId: string, event: string): Promise<Webhook[]>;
  create(data: Omit<Webhook, "id" | "created_at">): Promise<Webhook>;
  update(
    siteId: string,
    id: string,
    data: Partial<Omit<Webhook, "id" | "site_id" | "created_at">>
  ): Promise<Webhook>;
  delete(siteId: string, id: string): Promise<void>;
  createDelivery(
    data: Omit<WebhookDelivery, "id" | "created_at">
  ): Promise<WebhookDelivery>;
  findDeliveries(
    siteId: string,
    webhookId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WebhookDelivery>>;
}

// ---------------------------------------------------------------------------
// Redirect repository
// ---------------------------------------------------------------------------

export interface IRedirectRepository {
  findByFromPath(siteId: string, fromPath: string): Promise<Redirect | null>;
  findMany(
    siteId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Redirect>>;
  create(data: Omit<Redirect, "id" | "created_at">): Promise<Redirect>;
  bulkCreate(
    redirects: Array<Omit<Redirect, "id" | "created_at">>
  ): Promise<void>;
  delete(siteId: string, id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// API Key repository
// ---------------------------------------------------------------------------

export interface IApiKeyRepository {
  findById(siteId: string, id: string): Promise<ApiKey | null>;
  findByHash(keyHash: string): Promise<ApiKey | null>;
  findMany(
    siteId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<ApiKey>>;
  create(data: Omit<ApiKey, "id" | "created_at">): Promise<ApiKey>;
  revoke(siteId: string, id: string): Promise<void>;
  updateLastUsed(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Auth settings repository
// ---------------------------------------------------------------------------

export interface IAuthSettingsRepository {
  findBySiteId(siteId: string): Promise<SiteAuthSettings | null>;
  upsert(
    siteId: string,
    data: Partial<Omit<SiteAuthSettings, "site_id" | "updated_at">>
  ): Promise<SiteAuthSettings>;
}

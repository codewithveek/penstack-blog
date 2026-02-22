/**
 * packages/core/src/types/providers.ts
 *
 * Provider interface contracts for all external integrations.
 * Services import ONLY these interfaces.
 * Concrete SDK adapters live in apps/api/src/providers/.
 *
 * PRD §6.1: "No SDK calls outside adapter files"
 */

// ---------------------------------------------------------------------------
// Email provider
// ---------------------------------------------------------------------------

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[];
  from: EmailAddress;
  replyTo?: EmailAddress;
  subject: string;
  html: string;
  text?: string;
  /** Provider-specific tags/metadata */
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  messageId: string;
  /** Raw provider response for debugging */
  raw?: unknown;
}

export interface IEmailProvider {
  readonly name: string;
  send(options: SendEmailOptions): Promise<SendEmailResult>;
  sendBatch(messages: SendEmailOptions[]): Promise<SendEmailResult[]>;
}

// ---------------------------------------------------------------------------
// Payment provider
// ---------------------------------------------------------------------------

export interface CreateCheckoutOptions {
  siteId: string;
  memberId: string;
  memberEmail: string;
  tierId: string;
  tierName: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface CreatePortalSessionOptions {
  customerId: string;
  returnUrl: string;
}

export interface PortalSession {
  url: string;
}

export interface SubscriptionWebhookPayload {
  type:
    | "subscription.created"
    | "subscription.updated"
    | "subscription.deleted"
    | "payment.succeeded"
    | "payment.failed";
  providerSubscriptionId: string;
  providerCustomerId: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  raw: unknown;
}

export interface IPaymentProvider {
  readonly name: string;
  createCheckoutSession(
    options: CreateCheckoutOptions
  ): Promise<CheckoutSession>;
  createPortalSession(
    options: CreatePortalSessionOptions
  ): Promise<PortalSession>;
  parseWebhookPayload(
    body: string,
    signature: string,
    secret: string
  ): Promise<SubscriptionWebhookPayload>;
  cancelSubscription(providerSubscriptionId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Queue provider
// ---------------------------------------------------------------------------

export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: {
    type: "exponential" | "fixed";
    delay: number;
  };
  priority?: number;
}

export interface IQueueProvider {
  readonly name: string;
  enqueue<T>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobOptions
  ): Promise<string>;
  /** Schedule for a specific timestamp */
  scheduleAt<T>(
    queueName: string,
    jobName: string,
    data: T,
    runAt: Date
  ): Promise<string>;
  cancelJob(jobId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Storage (media upload) provider
// ---------------------------------------------------------------------------

export interface UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  /** Transformations (provider-specific, converted from generic format) */
  transforms?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpg" | "png";
  };
}

export interface UploadResult {
  providerId: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  mimeType?: string;
}

export interface IStorageProvider {
  readonly name: string;
  upload(
    file: Buffer | ReadableStream,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult>;
  delete(providerId: string): Promise<void>;
  getUrl(providerId: string): string;
}

// ---------------------------------------------------------------------------
// Search provider
// ---------------------------------------------------------------------------

export interface SearchDocument {
  id: string;
  siteId: string;
  type: "post" | "page";
  title: string;
  excerpt?: string;
  tags?: string[];
  publishedAt?: Date;
  url?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface ISearchProvider {
  readonly name: string;
  index(documents: SearchDocument[]): Promise<void>;
  delete(siteId: string, id: string): Promise<void>;
  search(
    siteId: string,
    query: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SearchResult[]>;
}

/**
 * apps/api/src/container.ts
 *
 * Dependency-injection wiring. All concrete classes are instantiated here — once.
 * Nothing else in the codebase calls `new PostRepository()` etc.
 *
 * Per AGENTS.md §3: "All concrete classes are instantiated exactly once in
 * apps/api/src/container.ts. No other file calls new PostRepository() or
 * new PostService()."
 *
 * Build order (AGENTS.md §16):
 *  DB → Redis/Cache → Providers → Repositories → Services → Controllers
 */

import { db } from "@cms/core/db/client";

// ── Infrastructure ──────────────────────────────────────────────────────────
import {
  getRedisConnection,
  resolveQueueProvider,
} from "./providers/queue/index";
import { Cache } from "./lib/cache";
import { resolveEmailProvider } from "./providers/email/index";
import { resolvePaymentProvider } from "./providers/payment/index";
import { resolveStorageProvider } from "./providers/storage/index";
import { resolveSearchProvider } from "./providers/search/index";

// ── Repositories ────────────────────────────────────────────────────────────
import { SiteRepository } from "./repositories/site.repository";
import { UserRepository } from "./repositories/user.repository";
import { PostRepository } from "./repositories/post.repository";
import { TagRepository } from "./repositories/tag.repository";
import { MemberRepository } from "./repositories/member.repository";
import { NewsletterRepository } from "./repositories/newsletter.repository";
import { MediaRepository } from "./repositories/media.repository";
import { SettingsRepository } from "./repositories/settings.repository";
import { WebhookRepository } from "./repositories/webhook.repository";
import { RedirectRepository } from "./repositories/redirect.repository";
import { ApiKeyRepository } from "./repositories/api-key.repository";
import { AuthSettingsRepository } from "./repositories/auth-settings.repository";

// ── Services ────────────────────────────────────────────────────────────────
import { SiteService } from "./services/site.service";
import { UserService } from "./services/user.service";
import { PostService } from "./services/post.service";
import { TagService } from "./services/tag.service";
import { MemberService } from "./services/member.service";
import { NewsletterService } from "./services/newsletter.service";
import { MediaService } from "./services/media.service";
import { SettingsService } from "./services/settings.service";
import { WebhookService } from "./services/webhook.service";
import { SetupService } from "./services/setup.service";
import { RedirectService } from "./services/redirect.service";
import { TierService } from "./services/tier.service";
import { AuthSettingsService } from "./services/auth-settings.service";

// ── Controllers ─────────────────────────────────────────────────────────────
import { PostController } from "./controllers/post.controller";
import { TagController } from "./controllers/tag.controller";
import { MemberController } from "./controllers/member.controller";
import { NewsletterController } from "./controllers/newsletter.controller";
import { MediaController } from "./controllers/media.controller";
import { SettingsController } from "./controllers/settings.controller";
import { WebhookController } from "./controllers/webhook.controller";
import { UserController } from "./controllers/user.controller";
import { SetupController } from "./controllers/setup.controller";
import { RedirectController } from "./controllers/redirect.controller";
import { TierController } from "./controllers/tier.controller";
import { AuthSettingsController } from "./controllers/auth-settings.controller";

// ── Middleware factories ─────────────────────────────────────────────────────
import { createSiteResolverMiddleware } from "./middleware/site-resolver.middleware";
import {
  createRequireAdminAuth,
  createRequireMemberAuth,
  createOptionalMemberAuth,
  requireRole,
} from "./middleware/auth.middleware";
import {
  authRateLimiter,
  publicApiRateLimiter,
  adminApiRateLimiter,
} from "./middleware/rate-limit.middleware";

// ── Wire ─────────────────────────────────────────────────────────────────────

// Infrastructure
const redis = getRedisConnection();
const cache = new Cache(redis);

// Providers (storage is async due to plugin registration)
const email = resolveEmailProvider();
const payment = resolvePaymentProvider();
const queue = resolveQueueProvider();
// Search provider resolved async (meilisearch adapter uses dynamic import to avoid
// requiring the meilisearch npm package when SEARCH_PROVIDER defaults to "tidb")
const search = await resolveSearchProvider(db);
// Storage is initialized lazily the first time it's needed (async resolver)
let _storage: Awaited<ReturnType<typeof resolveStorageProvider>> | null = null;
async function getStorage() {
  if (!_storage) _storage = await resolveStorageProvider();
  return _storage;
}

// Repositories
const siteRepo = new SiteRepository(db);
const userRepo = new UserRepository(db);
const postRepo = new PostRepository(db);
const tagRepo = new TagRepository(db);
const memberRepo = new MemberRepository(db);
const newsletterRepo = new NewsletterRepository(db);
const webhookRepo = new WebhookRepository(db);
const redirectRepo = new RedirectRepository(db);
const apiKeyRepo = new ApiKeyRepository(db);
const authSettingsRepo = new AuthSettingsRepository(db);
const settingsRepo = new SettingsRepository(db);
const mediaRepo = new MediaRepository(db);

// Services
const siteService = new SiteService(siteRepo, cache);
const userService = new UserService(userRepo);
const tagService = new TagService(tagRepo);
const webhookService = new WebhookService(webhookRepo);
const settingsService = new SettingsService(settingsRepo, apiKeyRepo, cache);
const newsletterService = new NewsletterService(newsletterRepo, memberRepo, email);
const memberService = new MemberService(memberRepo, email, payment);
const postService = new PostService(
  postRepo,
  tagRepo,
  settingsRepo,
  queue,
  search,
  cache
);

const redirectService = new RedirectService(redirectRepo, cache);
const tierService = new TierService(memberRepo);
const authSettingsService = new AuthSettingsService(authSettingsRepo);

// Media service gets storage lazily
async function getMediaService() {
  const storage = await getStorage();
  return new MediaService(mediaRepo, storage);
}

const setupService = new SetupService(
  siteService,
  userService,
  newsletterService,
  settingsService,
  email
);

// Controllers
const postController = new PostController(postService);
const tagController = new TagController(tagService);
const memberController = new MemberController(memberService);
const newsletterController = new NewsletterController(newsletterService);
const settingsController = new SettingsController(settingsService);
const webhookController = new WebhookController(webhookService);
const userController = new UserController(userService);
const setupController = new SetupController(setupService);
const redirectController = new RedirectController(redirectService);
const tierController = new TierController(tierService);
const authSettingsController = new AuthSettingsController(authSettingsService);

// Media controller is async (storage provider)
async function getMediaController() {
  const mediaService = await getMediaService();
  return new MediaController(mediaService);
}

// Middleware instances
const siteResolverMiddleware = createSiteResolverMiddleware(siteService);
const requireAdminAuth = createRequireAdminAuth(apiKeyRepo);
const requireMemberAuth = createRequireMemberAuth(memberRepo);
const optionalMemberAuth = createOptionalMemberAuth(memberRepo);

// Rate-limiter middleware instances (bound to the shared Redis connection)
const authRateLimiterMw = authRateLimiter(redis);
const publicApiRateLimiterMw = publicApiRateLimiter(redis);
const adminApiRateLimiterMw = adminApiRateLimiter(redis);

export {
  // Infrastructure
  redis,
  cache,
  // Providers
  email,
  payment,
  queue,
  search,
  // Repositories (exposed for middleware factories, workers, and tests)
  postRepo,
  newsletterRepo,
  webhookRepo,
  apiKeyRepo,
  memberRepo,
  // Services
  siteService,
  userService,
  tagService,
  webhookService,
  settingsService,
  newsletterService,
  memberService,
  postService,
  setupService,
  redirectService,
  tierService,
  authSettingsService,
  // Async helpers
  getMediaController,
  // Controllers
  postController,
  tagController,
  memberController,
  newsletterController,
  settingsController,
  webhookController,
  userController,
  setupController,
  redirectController,
  tierController,
  authSettingsController,
  // Middleware
  siteResolverMiddleware,
  requireAdminAuth,
  requireMemberAuth,
  optionalMemberAuth,
  requireRole,
  // Rate limiters — ready-to-use MiddlewareHandler instances (not the factories)
  authRateLimiterMw,
  publicApiRateLimiterMw,
  adminApiRateLimiterMw,
};

/**
 * apps/api/src/routes/index.ts
 *
 * Central route composition.
 *
 * Route groups (per AGENTS.md §7):
 *   /api/setup              — first-boot wizard          (no auth)
 *   /api/admin/v1/*         — admin dashboard API        (admin auth + admin rate limit)
 *   /api/content/v1/*       — public reader API          (public API key + public rate limit)
 *   /api/member/*           — member auth endpoints      (public, auth rate limit)
 *
 * Middleware injection order inside each group:
 *   site-resolver → rate-limiter → auth → requireRole → handler
 */

import { Hono } from "hono";

import {
  // Handlers
  createPostHandler,
} from "../handlers/post.handler";
import { createTagHandler } from "../handlers/tag.handler";
import { createMemberHandler } from "../handlers/member.handler";
import { createNewsletterHandler } from "../handlers/newsletter.handler";
import { createMediaHandler } from "../handlers/media.handler";
import { createSettingsHandler } from "../handlers/settings.handler";
import { createWebhookHandler } from "../handlers/webhook.handler";
import { createUserHandler } from "../handlers/user.handler";
import { createSetupHandler } from "../handlers/setup.handler";

import {
  // Controllers
  postController,
  tagController,
  memberController,
  newsletterController,
  settingsController,
  webhookController,
  userController,
  setupController,
  getMediaController,
  // Middleware
  siteResolverMiddleware,
  requireAdminAuth,
  requireMemberAuth,
  optionalMemberAuth,
  requireRole,
  authRateLimiter,
  publicApiRateLimiter,
  adminApiRateLimiter,
} from "../container";

// ── Handler instances ────────────────────────────────────────────────────────

const postApp = createPostHandler(postController);
const tagApp = createTagHandler(tagController);
const memberApp = createMemberHandler(memberController);
const newsletterApp = createNewsletterHandler(newsletterController);
const settingsApp = createSettingsHandler(settingsController);
const webhookApp = createWebhookHandler(webhookController);
const userApp = createUserHandler(userController);
const setupApp = createSetupHandler(setupController);

// mediaApp is async because its controller depends on async storage provider
let _mediaApp: ReturnType<typeof createMediaHandler> | null = null;
async function getMediaApp() {
  if (!_mediaApp) {
    const ctrl = await getMediaController();
    _mediaApp = createMediaHandler(ctrl);
  }
  return _mediaApp;
}

// ── Root router ──────────────────────────────────────────────────────────────

export const router = new Hono();

// ── Site resolver — applied globally ─────────────────────────────────────────
router.use("*", siteResolverMiddleware);

// ── Setup routes (no auth — only works before setup_completed = true) ─────────
router.route("/setup", setupApp);

// ── Admin API (/api/admin/v1) ─────────────────────────────────────────────────
const adminRouter = new Hono();
adminRouter.use("*", adminApiRateLimiter);
adminRouter.use("*", requireAdminAuth);

// Posts
adminRouter.route("/posts", postApp);

// Tags
adminRouter.route("/tags", tagApp);

// Members — CRUD is admin-only; auth sub-routes are handled inside the member handler
//           but we need to exclude /auth/* from requireAdminAuth.
//           We split: mount the member handler directly (it handles /auth/* internally).
//           Auth sub-routes within member handler are unauthenticated (see member.handler.ts).
const memberAdminRouter = new Hono();
memberAdminRouter.use("*", adminApiRateLimiter);
memberAdminRouter.use("*", requireAdminAuth);
memberAdminRouter.route("/", memberApp);
router.route("/admin/v1/members", memberAdminRouter);

// Member self-service auth (public, only rate-limited)
const memberAuthRouter = new Hono();
memberAuthRouter.use("*", authRateLimiter);
memberAuthRouter.post(
  "/magic-link",
  ...memberApp.routes
    .filter((r) => r.path === "/auth/magic-link")
    .map((r) => r.handler)
);
// Mount the full member app at /member (auth sub-routes accessible without admin auth)
router.use("/member/auth/*", authRateLimiter);
router.route("/member", memberApp);

// Newsletters
adminRouter.route("/newsletters", newsletterApp);

// Media (async handler)
adminRouter.use("/media/*", async (c, next) => {
  const app = await getMediaApp();
  return app.fetch(c.req.raw, {
    siteId: c.get("siteId"),
    userId: c.get("userId"),
    role: c.get("role"),
  });
});

// Settings
adminRouter.route("/settings", settingsApp);

// Webhooks
adminRouter.route("/webhooks", webhookApp);

// Users — create and delete restricted to owner role
const userRouter = new Hono();
userRouter.use("*", adminApiRateLimiter);
userRouter.use("*", requireAdminAuth);
userRouter.get(
  "/",
  ...userApp.routes
    .filter(() => true)
    .map(
      () => async (c: Parameters<typeof userApp.fetch>[1]) => userApp.fetch(c)
    )
);
// Mount full user handler; role guard for destructive ops is enforced inside the route
adminRouter.route("/users", userApp);

router.route("/admin/v1", adminRouter);

// ── Public content API (/api/content/v1) ──────────────────────────────────────
const contentRouter = new Hono();
contentRouter.use("*", publicApiRateLimiter);
contentRouter.use("*", optionalMemberAuth);

// Public post listing / reading
contentRouter.route("/posts", postApp);
contentRouter.route("/tags", tagApp);

router.route("/content/v1", contentRouter);

/**
 * apps/api/src/routes/index.ts
 *
 * Central route composition.
 *
 * Route groups (per AGENTS.md §7):
 *   /setup                  — first-boot wizard          (no auth)
 *   /admin/v1/*             — admin dashboard API        (admin auth + admin rate limit)
 *   /content/v1/*           — public reader API          (nil/optional member auth)
 *   /member/auth/*          — member auth endpoints      (public, auth rate limited)
 *
 * Middleware injection order inside each group:
 *   site-resolver → rate-limiter → auth → handler
 */

import { Hono } from "hono";

import { createPostHandler } from "../handlers/post.handler";
import { createTagHandler } from "../handlers/tag.handler";
import {
  createMemberAdminHandler,
  createMemberAuthHandler,
} from "../handlers/member.handler";
import { createNewsletterHandler } from "../handlers/newsletter.handler";
import { createMediaHandler } from "../handlers/media.handler";
import { createSettingsHandler } from "../handlers/settings.handler";
import { createWebhookHandler } from "../handlers/webhook.handler";
import { createUserHandler } from "../handlers/user.handler";
import { createSetupHandler } from "../handlers/setup.handler";
import {
  createContentAuthorsHandler,
  createContentPagesHandler,
  createContentSettingsHandler,
  createContentTiersHandler,
} from "../handlers/content.handler";
import { createRedirectHandler } from "../handlers/redirect.handler";
import { createTierHandler } from "../handlers/tier.handler";
import { createAuthSettingsHandler } from "../handlers/auth-settings.handler";

import {
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
  getMediaController,
  siteResolverMiddleware,
  requireAdminAuth,
  optionalMemberAuth,
  authRateLimiterMw,
  publicApiRateLimiterMw,
  adminApiRateLimiterMw,
} from "../container";

// ── Handler instances ─────────────────────────────────────────────────────────

const postApp = createPostHandler(postController);
const tagApp = createTagHandler(tagController);
const memberAdminApp = createMemberAdminHandler(memberController);
const memberAuthApp = createMemberAuthHandler(memberController);
const newsletterApp = createNewsletterHandler(newsletterController);
const settingsApp = createSettingsHandler(settingsController);
const webhookApp = createWebhookHandler(webhookController);
const userApp = createUserHandler(userController);
const setupApp = createSetupHandler(setupController);
const redirectApp = createRedirectHandler(redirectController);
const tierApp = createTierHandler(tierController);
const authSettingsApp = createAuthSettingsHandler(authSettingsController);

// Content API (public, read-only)
const contentAuthorsApp = createContentAuthorsHandler(userController);
const contentPagesApp = createContentPagesHandler(postController);
const contentSettingsApp = createContentSettingsHandler(settingsController);
const contentTiersApp = createContentTiersHandler(memberController);

// Media handler is async because the controller depends on the async storage provider.
// Lazily initialized — only resolved when the first media request arrives.
let _mediaApp: ReturnType<typeof createMediaHandler> | null = null;
async function getMediaApp() {
  if (!_mediaApp) {
    const ctrl = await getMediaController();
    _mediaApp = createMediaHandler(ctrl);
  }
  return _mediaApp;
}

// ── Root router ───────────────────────────────────────────────────────────────

export const router = new Hono();

// Site resolver runs on every request
router.use("*", siteResolverMiddleware);

// ── Setup (no auth) ───────────────────────────────────────────────────────────
router.route("/setup", setupApp);

// ── Internal endpoints (server-to-server, bypasses site resolver) ─────────────
router.get("/internal/sites/resolve", async (c) => {
  const host = c.req.query("host");
  if (!host) {
    return c.json(
      { error: { code: "BAD_REQUEST", message: "Missing host query param" } },
      400
    );
  }
  const { siteService: siteSvc } = await import("../container");
  const site = await siteSvc.getByHost(host);
  if (!site) {
    return c.json(
      { error: { code: "SITE_NOT_FOUND", message: "Site not found" } },
      404
    );
  }
  return c.json({
    data: {
      id: site.id,
      name: site.name,
      setup_completed: site.setup_completed,
    },
  });
});

// ── Member auth (public, rate-limited) ────────────────────────────────────────
router.use("/member/auth/*", authRateLimiterMw);
router.route("/member/auth", memberAuthApp);

// ── Admin API ─────────────────────────────────────────────────────────────────

const adminRouter = new Hono<{
  Variables: { siteId: string; userId: string; role: string };
}>();

// All admin routes: admin rate limit + admin auth
adminRouter.use("*", adminApiRateLimiterMw);
adminRouter.use("*", requireAdminAuth);

// Posts
adminRouter.route("/posts", postApp);

// Tags
adminRouter.route("/tags", tagApp);

// Members (CRUD only — auth sub-routes are at /member/auth)
adminRouter.route("/members", memberAdminApp);

// Newsletters
adminRouter.route("/newsletters", newsletterApp);

// Media — async init (proxy with path-prefix stripping)
adminRouter.all("/media", async (c) => {
  const app = await getMediaApp();
  const url = new URL(c.req.raw.url);
  url.pathname = "/";
  return app.fetch(new Request(url.href, c.req.raw));
});
adminRouter.all("/media/*", async (c) => {
  const app = await getMediaApp();
  // Strip /media prefix so the inner app sees /upload, /:id, etc.
  const url = new URL(c.req.raw.url);
  url.pathname = c.req.path.replace(/^\/media/, "") || "/";
  return app.fetch(new Request(url.href, c.req.raw));
});

// Settings (site config + API key management)
adminRouter.route("/settings", settingsApp);

// Webhooks
adminRouter.route("/webhooks", webhookApp);

// Users
adminRouter.route("/users", userApp);

// Redirects
adminRouter.route("/redirects", redirectApp);

// Tiers
adminRouter.route("/tiers", tierApp);

// Auth settings (per-site OAuth config)
adminRouter.route("/auth-settings", authSettingsApp);

router.route("/admin/v1", adminRouter);

// ── Public content API ────────────────────────────────────────────────────────

const contentRouter = new Hono<{ Variables: { siteId: string } }>();

contentRouter.use("*", publicApiRateLimiterMw);
contentRouter.use("*", optionalMemberAuth);

// Public post reading (returns only published posts at service layer)
contentRouter.route("/posts", postApp);
contentRouter.route("/tags", tagApp);
contentRouter.route("/authors", contentAuthorsApp);
contentRouter.route("/pages", contentPagesApp);
contentRouter.route("/settings", contentSettingsApp);
contentRouter.route("/tiers", contentTiersApp);

router.route("/content/v1", contentRouter);

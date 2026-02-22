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
import { createMemberAdminHandler, createMemberAuthHandler } from "../handlers/member.handler";
import { createNewsletterHandler } from "../handlers/newsletter.handler";
import { createMediaHandler } from "../handlers/media.handler";
import { createSettingsHandler } from "../handlers/settings.handler";
import { createWebhookHandler } from "../handlers/webhook.handler";
import { createUserHandler } from "../handlers/user.handler";
import { createSetupHandler } from "../handlers/setup.handler";

import {
  postController,
  tagController,
  memberController,
  newsletterController,
  settingsController,
  webhookController,
  userController,
  setupController,
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

// Media handler is async because the controller depends on the async storage provider.
// Eagerly initialize so it's ready before the first request arrives.
const _mediaInit = getMediaController().then((ctrl) => createMediaHandler(ctrl));

// ── Root router ───────────────────────────────────────────────────────────────

export const router = new Hono();

// Site resolver runs on every request
router.use("*", siteResolverMiddleware);

// ── Setup (no auth) ───────────────────────────────────────────────────────────
router.route("/setup", setupApp);

// ── Member auth (public, rate-limited) ────────────────────────────────────────
router.use("/member/auth/*", authRateLimiterMw);
router.route("/member/auth", memberAuthApp);

// ── Admin API ─────────────────────────────────────────────────────────────────

const adminRouter = new Hono<{ Variables: { siteId: string; userId: string; role: string } }>();

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
  const app = await _mediaInit;
  const url = new URL(c.req.raw.url);
  url.pathname = "/";
  return app.fetch(new Request(url.href, c.req.raw));
});
adminRouter.all("/media/*", async (c) => {
  const app = await _mediaInit;
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

router.route("/admin/v1", adminRouter);

// ── Public content API ────────────────────────────────────────────────────────

const contentRouter = new Hono<{ Variables: { siteId: string } }>();

contentRouter.use("*", publicApiRateLimiterMw);
contentRouter.use("*", optionalMemberAuth);

// Public post reading (returns only published posts at service layer)
contentRouter.route("/posts", postApp);
contentRouter.route("/tags", tagApp);

router.route("/content/v1", contentRouter);

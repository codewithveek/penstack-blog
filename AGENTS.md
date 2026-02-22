# AGENTS.md

## AI Agent Instructions — Open CMS Platform

This file is the source of truth for any AI agent (Claude, Cursor, Copilot, Codex, etc.)
working on this codebase. Read it fully before writing, editing, or deleting any file.
The companion specification for this project is `CMS_PRD.md` — treat it as law.

---

## Table of Contents

- [AGENTS.md](#agentsmd)
  - [AI Agent Instructions — Open CMS Platform](#ai-agent-instructions--open-cms-platform)
  - [Table of Contents](#table-of-contents)
  - [1. Project Overview](#1-project-overview)
  - [2. The Prime Directives](#2-the-prime-directives)
  - [3. Architecture Rules](#3-architecture-rules)
    - [What each layer owns](#what-each-layer-owns)
    - [Dependency injection](#dependency-injection)
  - [4. File \& Folder Conventions](#4-file--folder-conventions)
    - [Naming](#naming)
    - [Location rules](#location-rules)
  - [5. TypeScript Rules](#5-typescript-rules)
  - [6. Database Rules](#6-database-rules)
    - [Drizzle schema](#drizzle-schema)
    - [Indexes (mandatory)](#indexes-mandatory)
    - [Migrations](#migrations)
    - [Query rules](#query-rules)
  - [7. API \& Routing Rules](#7-api--routing-rules)
    - [Hono](#hono)
    - [Hono RPC client](#hono-rpc-client)
    - [Error handling](#error-handling)
  - [8. Auth Rules](#8-auth-rules)
  - [9. Multi-Tenancy Rules](#9-multi-tenancy-rules)
  - [10. Testing Rules](#10-testing-rules)
    - [Mocking repositories in service tests](#mocking-repositories-in-service-tests)
  - [11. Security Rules](#11-security-rules)
  - [12. Editor Rules](#12-editor-rules)
  - [13. Theming Rules](#13-theming-rules)
  - [14. Provider / Integration Rules](#14-provider--integration-rules)
    - [Configurable providers](#configurable-providers)
    - [FluxMedia (@fluxmedia/core) specifics](#fluxmedia-fluxmediacore-specifics)
    - [Payment webhook normalization](#payment-webhook-normalization)
  - [15. Performance Rules](#15-performance-rules)
  - [16. How to Work on This Codebase](#16-how-to-work-on-this-codebase)
    - [Before writing any code](#before-writing-any-code)
    - [Dependency order when building new features](#dependency-order-when-building-new-features)
    - [When modifying existing files](#when-modifying-existing-files)
    - [When adding a new Drizzle table](#when-adding-a-new-drizzle-table)
  - [17. Dos](#17-dos)
  - [18. Do Nots](#18-do-nots)
    - [Architecture violations](#architecture-violations)
    - [TypeScript violations](#typescript-violations)
    - [Security violations](#security-violations)
    - [Quality violations](#quality-violations)
  - [19. When You Are Unsure](#19-when-you-are-unsure)
  - [20. Checklist Before Completing Any Task](#20-checklist-before-completing-any-task)

---

## 1. Project Overview

This is a production-grade, multi-tenant CMS platform — a Ghost-equivalent built on:

- **Next.js 16** (App Router) + **React 19** — frontend and SSR
- **Hono.js** — API server (mounted at `/api/[[...route]]` or standalone)
- **MySQL (TiDB)** + **Drizzle ORM** — database
- **Better Auth** — authentication (magic link + configurable OAuth per site)
- **BullMQ + Redis** — job queue (pg-boss as configurable alternative)
- **Resend** + **React Email** — transactional and newsletter email
- **Stripe** — payments (Polar.sh, Paystack as configurable alternatives)
- **@fluxmedia/core** — provider-agnostic media upload library (R2, S3, Cloudinary)
- **Tiptap** — rich text editor with custom extensions
- **Chakra UI 3** — admin dashboard UI only
- **TypeScript strict mode** throughout — no exceptions

The full specification lives in `CMS_PRD.md`. When this file and the PRD conflict,
the PRD wins. When this file is more specific than the PRD on implementation detail,
this file wins.

---

## 2. The Prime Directives

These are non-negotiable. Violating any of these is a breaking change regardless
of whether the feature works.

**1. The database is never accessed outside of repository files.**
No exceptions. Not in services. Not in controllers. Not in handlers. Not in middleware.
Not in Next.js Server Actions or Server Components. Only `*.repository.ts` files import
from `@cms/core/db/client`.

**2. HTTP concerns never leak past the handler layer.**
`req`, `res`, `c` (Hono context), status codes, and headers are handler/middleware
concerns only. Controllers and everything below them are HTTP-unaware.

**3. External SDKs are never called outside of provider adapter files.**
Stripe, Resend, BullMQ, Meilisearch — none of these are imported in services,
controllers, or handlers. Only `apps/api/src/providers/**/*.ts` files touch SDKs.

**4. `site_id` is always sourced from the authenticated session or API key.**
Never from a URL parameter, query string, or request body provided by the client.
A client claiming to operate on a site they don't own must fail at the middleware layer.

**5. TypeScript strict mode is always on. `any` is never used.**
If you don't know the type, derive it or ask. Do not cast to `any` to make a
compiler error go away. Do not use `@ts-ignore` without a comment explaining the
exact reason and why it cannot be avoided.

**6. Every file is complete. No stubs, no TODOs, no placeholders.**
`// TODO: implement this` is not acceptable in committed code. If a feature is not
ready, it does not exist in the file yet — don't scaffold it partially.

---

## 3. Architecture Rules

The codebase follows a strict 5-layer architecture. Every request travels this exact
path and no other:

```
HTTP Request
  → Middleware (auth, site resolution, rate limiting)
    → Route Handler  (parse HTTP, validate input with Zod, call controller)
      → Controller   (orchestrate service calls, no business logic)
        → Service    (all business logic, calls repositories + providers)
          → Repository  (all DB access via Drizzle, returns domain types)
            → MySQL / TiDB
```

### What each layer owns

**Middleware** (`apps/api/src/middleware/`, `apps/web/middleware.ts`)

- Resolves the current site from the request host
- Verifies auth session / JWT / API key
- Injects `siteId`, `userId`, `role` into request context
- Enforces setup wizard guard
- Rate limiting

**Handler** (`apps/api/src/handlers/*.handler.ts`)

- Reads from Hono context (`c`)
- Parses and validates request body/params/query with Zod
- Calls one controller method
- Returns a typed HTTP response
- Catches typed errors and maps them to HTTP status codes
- Knows nothing about business logic

**Controller** (`apps/api/src/controllers/*.controller.ts`)

- Receives typed, validated DTOs (not raw request data)
- Orchestrates one or more service method calls
- Returns typed domain objects or throws typed errors
- No `if status === 200` — no HTTP awareness whatsoever
- No Drizzle imports. No SDK imports.

**Service** (`apps/api/src/services/*.service.ts`)

- Contains all business logic
- Enforces domain rules ("a post must have at least one primary author before publish")
- Calls repository interfaces (never concrete classes directly)
- Calls provider adapter interfaces (never SDKs directly)
- Throws typed errors from `packages/core/errors/`
- No Drizzle imports. No SDK imports. No HTTP imports.

**Repository** (`apps/api/src/repositories/*.repository.ts`)

- The ONLY layer that imports from `@cms/core/db/client`
- Accepts typed parameters, returns typed domain objects (not raw Drizzle rows)
- Contains Drizzle query builder code
- No business logic — just data access patterns
- One repository per aggregate root

### Dependency injection

All concrete classes are instantiated exactly once in `apps/api/src/container.ts`.
No other file calls `new PostRepository()` or `new PostService()`.
Services receive repository **interfaces**, not concrete classes.
This is not negotiable — it is what makes the codebase testable.

---

## 4. File & Folder Conventions

### Naming

| Type                 | Convention                                                     | Example                   |
| -------------------- | -------------------------------------------------------------- | ------------------------- |
| Repository           | `{entity}.repository.ts`                                       | `post.repository.ts`      |
| Repository interface | `I{Entity}Repository` in `packages/core/types/repositories.ts` | `IPostRepository`         |
| Service              | `{entity}.service.ts`                                          | `post.service.ts`         |
| Controller           | `{entity}.controller.ts`                                       | `post.controller.ts`      |
| Handler              | `{entity}.handler.ts`                                          | `post.handler.ts`         |
| Route file           | `{entity}.routes.ts`                                           | `post.routes.ts`          |
| Provider adapter     | `{provider}.adapter.ts` inside the right provider folder       | `stripe.adapter.ts`       |
| Zod schema           | `{entity}.schema.ts` in `packages/core/validators/`            | `post.schema.ts`          |
| Domain type          | `{entity}.types.ts` in `packages/core/types/`                  | `post.types.ts`           |
| Drizzle schema       | `{entity}.ts` in `packages/core/db/schema/`                    | `posts.ts`                |
| Error class          | `{Domain}Error` extending `AppError`                           | `PostNotFoundError`       |
| Tiptap extension     | `{Name}.extension.ts`                                          | `ImageBlock.extension.ts` |
| React Email template | `{name}.email.tsx`                                             | `magic-link.email.tsx`    |
| Theme page component | `{Page}.tsx` inside the theme's `pages/` dir                   | `Post.tsx`                |

### Location rules

- Business logic that is specific to the API → `apps/api/src/services/`
- Types shared between frontend and API → `packages/core/types/`
- Zod schemas shared between frontend and API → `packages/core/validators/`
- Drizzle table definitions → `packages/core/db/schema/`
- DB client instance → `packages/core/db/client.ts` (not re-exported from `packages/core/index.ts`)
- Email templates → `packages/emails/templates/`
- Theme engine → `packages/themes/engine/`
- Admin UI components → `apps/web/components/admin/`
- Editor components and extensions → `apps/web/components/editor/`
- Public theme wrapper components → `apps/web/components/site/`
- Hono app entry → `apps/api/src/index.ts`
- Next.js middleware → `apps/web/middleware.ts`

---

## 5. TypeScript Rules

- `strict: true` in every `tsconfig.json`. This is already set — do not change it.
- No `any`. Not even `as any`. Not even `unknown as SomeType` without a runtime check.
- No `@ts-ignore`. Use `@ts-expect-error` only with a comment explaining the exact
  reason. Occurrences of `@ts-expect-error` must be treated as tech debt.
- Derive types from Drizzle schemas using `$inferSelect` and `$inferInsert`.
  Do not hand-write types that duplicate what Drizzle already knows.
- Domain types (what services and controllers deal with) live in `packages/core/types/`
  and may differ from DB record types. A `Post` domain type can have joined
  fields (`authors: Author[]`) that the raw DB row does not.
- All Zod schemas live in `packages/core/validators/`. Infer TypeScript types
  from them (`z.infer<typeof Schema>`). Do not write parallel manual interfaces
  for the same shape.
- Hono RPC types are auto-generated from route definitions. Do not manually
  type API responses in the frontend — use the generated client from
  `apps/web/lib/api-client.ts`.
- Use `satisfies` over `as` wherever possible. `satisfies` narrows; `as` lies.
- All async functions must have typed return values. No implicit `Promise<any>`.
- Enums: use TypeScript `const` objects + `as const` over `enum` keyword.
  `enum` generates runtime code and has surprising behavior with Zod.

```ts
// ✅ Correct
export const PostStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SCHEDULED: "scheduled",
  ARCHIVED: "archived",
} as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];

// ❌ Wrong
enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}
```

---

## 6. Database Rules

### Drizzle schema

- All table definitions live in `packages/core/db/schema/`
- One file per domain entity (e.g., `posts.ts`, `members.ts`)
- All are re-exported from `packages/core/db/schema/index.ts`
- Every tenant-scoped table **must** have a `site_id` column as the first non-PK column
- Every table **must** have `created_at` and `updated_at` timestamp columns
- Primary keys are `varchar(36)` UUIDs generated at the application layer (`crypto.randomUUID()`)
  before insert — never auto-increment integers
- Use `mysqlEnum` for status/type columns. Never store magic strings in `varchar` columns
  when a closed set of values is known at design time

### Indexes (mandatory)

Every tenant-scoped table must have at minimum:

- Composite index on `(site_id, id)`
- Composite index on `(site_id, created_at)` for time-ordered list queries
- Unique index on any slug/permalink column scoped to the site: `(site_id, slug)`

### Migrations

- Never edit an existing migration file after it has been committed
- Schema changes = new migration file generated with `drizzle-kit generate`
- Never run `drizzle-kit push` against production — only run migrations
- Every migration must be reversible unless there is an explicit irreversibility comment

### Query rules

- All queries are parameterized through Drizzle — never concatenate user input into queries
- Repositories always filter by `site_id` first — never query across tenants
- Use Drizzle's `.where(and(...))` pattern with explicit conditions
- Pagination is always cursor-based or offset-based with an explicit `limit` — never unbounded queries
- `SELECT *` is never used — always specify columns or use Drizzle's inferred select

---

## 7. API & Routing Rules

### Hono

- Routes are defined in `apps/api/src/routes/` and mounted in `apps/api/src/index.ts`
- Handlers live in `apps/api/src/handlers/` — one file per domain
- Every route has explicit Zod validation via `zValidator` middleware before the handler runs
- Every route that mutates data requires auth middleware to run first
- Content API routes (`/api/content/v1/`) are public but require a valid public API key
- Admin API routes (`/api/admin/v1/`) require a valid admin JWT or admin API key
- All responses use the standard envelope: `{ data: T }` for success, `{ error: { code, message } }` for errors
- Paginated responses use: `{ data: T[], meta: { total, page, limit, pages } }`
- HTTP status codes: 200 (ok), 201 (created), 204 (deleted), 400 (validation), 401 (unauthenticated), 403 (unauthorized), 404 (not found), 409 (conflict), 422 (unprocessable), 500 (server error)

### Hono RPC client

- The frontend **only** calls the API via the typed Hono RPC client at `apps/web/lib/api-client.ts`
- No `fetch()` calls with manual URL construction in frontend code
- No manual TypeScript interfaces for API response shapes in the frontend

### Error handling

Every handler wraps its controller call in a try/catch that maps typed errors to HTTP:

```ts
// Standard handler error mapping pattern
try {
  const result = await postController.publish(siteId, postId);
  return c.json({ data: result }, 200);
} catch (err) {
  if (err instanceof NotFoundError) return c.json({ error: err.toJSON() }, 404);
  if (err instanceof ConflictError) return c.json({ error: err.toJSON() }, 409);
  if (err instanceof ValidationError)
    return c.json({ error: err.toJSON() }, 422);
  if (err instanceof ForbiddenError)
    return c.json({ error: err.toJSON() }, 403);
  // Unknown errors are logged and return 500
  logger.error(err);
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500
  );
}
```

All typed error classes extend `AppError` from `packages/core/errors/`. Do not throw
raw `Error` objects from services or controllers.

---

## 8. Auth Rules

- Better Auth handles all authentication. Do not build custom session management.
- **Admin auth** and **member auth** are completely separate session namespaces.
  An admin session cannot be used to access member-only content and vice versa.
- The `site_id` a user is authorized to operate on comes from their Better Auth
  session's organization/site context — never from a request parameter.
- Magic link is always available and cannot be disabled by site settings.
- Social login (Google, Facebook, GitHub) is opt-in per site via `site_auth_settings`.
  Social login for admins is off by default (`allow_social_for_admins: false`).
- OAuth client credentials (`client_id`, `client_secret`) are stored encrypted
  (AES-256-GCM) in the database. They are never stored in plaintext.
  The encryption key comes from `ENCRYPTION_KEY` environment variable only.
- Magic link tokens are SHA-256 hashed before storage. The raw token is never stored.
  Tokens expire in 15 minutes and are single-use.
- JWTs: access tokens expire in 15 minutes, refresh tokens in 7 days.
- Member sessions are stored in HTTP-only, SameSite=Strict cookies.
- Never log tokens, secrets, or session identifiers.

---

## 9. Multi-Tenancy Rules

- Every repository method that reads or writes tenant data takes `siteId: string`
  as its first parameter. No exceptions.
- `siteId` is injected into Hono context by the `site-resolver` middleware.
  Handlers read it from `c.get('siteId')`. It is never read from `c.req.param()`.
- Site resolution happens in Next.js middleware for the web app and in Hono
  middleware for the API. Both resolve by `Host` header against the `sites` table
  (cached in Redis, TTL 5 minutes).
- Custom domain resolution: look up `sites.custom_domain`. Subdomain resolution:
  parse `{slug}.platform.com` and look up `sites.subdomain`.
- The Redis cache key for site resolution is `site:host:{hostname}`.
  Invalidate it when a site's domain or subdomain changes.
- If the resolved site has `setup_completed = false`, redirect to `/setup`.
  This check is in middleware and runs before route handlers.
- Never return data from one tenant in a response scoped to another tenant.
  Repository-level `site_id` filtering is the enforcement mechanism.

---

## 10. Testing Rules

- Unit tests live in `__tests__/unit/` adjacent to the file under test
- Integration tests live in `__tests__/integration/`
- Test file naming: `{filename}.test.ts`
- Services are unit-tested by mocking repository interfaces — no real DB in unit tests
- Repositories are integration-tested against a real test DB (seeded fresh per test file)
- Handlers are tested via Hono's test helpers with mocked controllers
- No snapshot tests for business logic — test behavior, not shape
- Every service method must have at least one unit test covering:
  - The happy path
  - The primary error case (e.g., not found, conflict)
  - Any guard condition (e.g., "cannot publish without primary author")
- Use `vitest` as the test runner
- Test coverage target: 80% on `services/`, 70% on `repositories/`, 60% on `handlers/`

### Mocking repositories in service tests

```ts
// ✅ Correct — mock the interface, inject into service
const mockPostRepo: IPostRepository = {
  findById: vi.fn(),
  create: vi.fn(),
  // ...all interface methods
};
const service = new PostService(mockPostRepo, mockQueueProvider);
```

---

## 11. Security Rules

These are hard requirements, not suggestions.

- **Never commit secrets.** No API keys, no passwords, no tokens in code or comments.
  All secrets come from environment variables.
- **Never log sensitive data.** Do not log: tokens, passwords, API keys, session IDs,
  payment data, full request bodies on auth routes.
- **Validate all input with Zod** before it reaches a controller. This is enforced
  at the handler layer. Shape validation, type coercion, and length limits all happen here.
- **Sanitize rich text content** server-side before storage using a strict HTML allowlist.
  DOMPurify (server-side via `isomorphic-dompurify`) is used for `HTMLBlock` content.
- **MIME type validation** on uploads is server-side only. Never trust the `Content-Type`
  header or file extension provided by the client. Read the file's magic bytes.
- **Webhook signatures** are verified using constant-time comparison (`crypto.timingSafeEqual`).
  Never use `===` for signature comparison.
- **Rate limiting** is enforced via Redis sliding window on all public API endpoints
  (60 req/min per API key) and auth endpoints (10 req/min per IP).
- **API keys** are shown once at creation. Only a SHA-256 hash + salt is stored.
  There is no "reveal key" feature.
- **Encrypted columns** (OAuth secrets, webhook secrets): encryption happens in the
  repository layer before write, decryption after read. Services always see plaintext.
- **`site_id` sourced from session**: enforced at the middleware layer.
  If a handler is calling a service with a `site_id` from `c.req.param()`, that is a bug.
- **HSTS headers** on all responses: `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- **No user-uploaded executable code.** Themes are curated. File uploads are media only
  (images, video, documents). Any upload that is not an accepted MIME type is rejected.

---

## 12. Editor Rules

- The editor is built on raw **Tiptap** — do not use `@chakra-ui/tiptap` or any
  other Tiptap wrapper library.
- Each custom extension lives in its own file:
  `apps/web/components/editor/extensions/{ExtensionName}.extension.ts`
- Extensions export: the Tiptap extension object, a TypeScript type for the extension's
  node/mark attributes, and a renderer function used by the server-side HTML renderer.
- The server-side HTML renderer (`packages/core/content/renderer.ts`) must handle every
  custom extension node type. If you add an extension, you must add its renderer case.
- The `lexical` column (Tiptap JSON) is the source of truth. The `html` column is a
  derived, cached render. Never store hand-crafted HTML as the primary content.
- Autosave is implemented as `AutosaveExtension` — a custom Tiptap extension using
  `onUpdate` + lodash `debounce` (2000ms default). It is togglable per user.
  When disabled, a manual "Save draft" button is visible in the toolbar.
- Autosave calls `PATCH /api/admin/v1/posts/:id` with the full Tiptap JSON.
  It does not save on every keystroke — only after the debounce fires and only
  if content has changed since last save (deep equality check).
- The `useMediaUpload` hook from `@fluxmedia/react` is used for all file uploads
  inside the editor. It operates in `signed` mode — files go directly to storage,
  not through the API server.
- Slash commands (`/`) are the primary block insertion mechanism.
  Every custom extension must register its slash command in
  `apps/web/components/editor/slash-commands.ts`.

---

## 13. Theming Rules

- **Chakra UI 3 is used in the admin dashboard only.** It is never imported in:
  - Theme page components (`packages/themes/*/pages/`)
  - The public site route group (`apps/web/app/(site)/`)
  - Any shared package that is used by themes
- Theme page components receive data only through the `ThemePageProps` interface
  defined in `packages/core/types/theme.ts`. They do not call APIs, query the DB,
  or read environment variables.
- Themes must export the components listed in their `theme.json` `routes` map.
  Missing a route export is a build error.
- Theme CSS is isolated using CSS layers: `@layer theme { ... }`. This prevents
  theme styles from bleeding into admin UI and vice versa.
- Themes that use Tailwind include their own `tailwind.config.js` scoped to their
  directory. They do not share the root Tailwind config.
- The `ThemePostContext.authors` field is always an array of one or more authors.
  The `ThemePostContext.primaryAuthor` field is always populated.
  Theme templates must render at least the primary author and optionally render
  additional authors — they must never assume a single author.
- Theme components are loaded via Next.js `dynamic()` imports. They are never
  statically imported in the site route group layout.

---

## 14. Provider / Integration Rules

Every external service integration follows this pattern:

1. An interface lives in `packages/core/types/providers.ts`
2. One or more adapter files live in `apps/api/src/providers/{category}/{name}.adapter.ts`
3. A resolver function in `apps/api/src/providers/{category}/index.ts` reads the
   relevant env var and returns the correct adapter instance
4. The resolver is called **once** in `apps/api/src/container.ts`
5. Services depend on the interface type, never the adapter class

### Configurable providers

| Category | Interface                   | Default  | Alternatives           |
| -------- | --------------------------- | -------- | ---------------------- |
| Email    | `IEmailProvider`            | Resend   | Mailgun, Postmark, SES |
| Payment  | `IPaymentProvider`          | Stripe   | Polar.sh, Paystack     |
| Queue    | `IQueueProvider`            | BullMQ   | pg-boss                |
| Storage  | `MediaUploader` (FluxMedia) | R2       | S3, Cloudinary         |
| Search   | `ISearchProvider`           | TiDB FTS | Meilisearch            |

### FluxMedia (@fluxmedia/core) specifics

- Install the core package plus the provider package(s) you need:
  `@fluxmedia/core`, `@fluxmedia/r2`, `@fluxmedia/s3`, `@fluxmedia/cloudinary`
- The `@fluxmedia/plugins` package is used for file validation, metadata extraction,
  and retry. Always configure the validation and metadata plugins at minimum.
- The `@fluxmedia/react` `useMediaUpload` hook is used in the editor — not in the API.
- `MediaUploader` is instantiated in `container.ts` with the resolved provider.
  `MediaService` receives it as a constructor argument.
- Cloudinary is the only provider with native image transformations. For R2/S3,
  a separate transform layer (Cloudflare Images or imgproxy) must be configured
  if you need on-the-fly image resizing.

### Payment webhook normalization

Every payment provider adapter must normalize its raw webhook payload to
`NormalizedPaymentEvent` before returning it from `constructWebhookEvent()`.
Business logic in `MemberService` and `SubscriptionService` only handles
`NormalizedPaymentEvent` — it never contains Stripe- or Polar-specific types.

---

## 15. Performance Rules

- **Never make unbounded DB queries.** Every list query has an explicit `limit`.
  Default page size is 15. Maximum page size is 100.
- **Cache aggressively with the right TTLs** (see PRD Section 23.1):
  - Site resolution: 5 min
  - Published post HTML: 10 min, invalidated on update/delete
  - Public API responses: 60s (also set `Cache-Control` header)
  - Redirect table per site: 10 min
- **Invalidate cache correctly.** When a post is updated, delete its Redis key.
  When a site's domain changes, delete its site resolution key. Use a helper:
  `cache.invalidate('post:html:{siteId}:{postId}')`.
- **ISR for public content.** Public post pages use `revalidate = 60` (Next.js ISR).
  Member-gated pages use SSR (`revalidate = 0` or `dynamic = 'force-dynamic'`).
- **All images use `next/image`.** No raw `<img>` tags in the admin or in the
  default themes. Theme authors are strongly encouraged to use `next/image` too.
- **Editor extensions are lazy-loaded.** Each Tiptap extension is loaded with a
  dynamic import at runtime. Never statically import all extensions into the
  editor bundle.
- **No N+1 queries.** If you're fetching a post and its authors, use a join or
  a batched query — not a loop that calls `findById` per author.
- **Database connection pooling** is configured via the Drizzle client setup.
  Do not create new connections per request.

---

## 16. How to Work on This Codebase

### Before writing any code

1. Read the relevant PRD section for the feature you are implementing
2. Check `packages/core/types/` to see if the domain type already exists
3. Check `packages/core/validators/` to see if the Zod schema already exists
4. Check `packages/core/db/schema/` to see if the table already exists
5. If the DB schema needs a change, create a migration first — before writing service code
6. Identify which layers need to be added or modified (usually: schema → type → validator → repository → service → controller → handler → route)

### Dependency order when building new features

Always work in this order so downstream files never import from files that don't exist yet:

```
1. packages/core/db/schema/          ← Drizzle table definition
2. packages/core/types/              ← Domain types
3. packages/core/validators/         ← Zod input schemas
4. packages/core/errors/             ← Any new error classes needed
5. apps/api/src/repositories/        ← Repository interface (in core) + implementation
6. apps/api/src/providers/           ← Provider adapter (if new integration)
7. apps/api/src/services/            ← Business logic
8. apps/api/src/controllers/         ← Orchestration
9. apps/api/src/handlers/            ← HTTP layer
10. apps/api/src/routes/             ← Route mounting
11. apps/api/src/container.ts        ← Wire the new dependencies
12. apps/web/...                     ← Frontend components, hooks, pages
```

### When modifying existing files

- Read the entire file before making changes — never grep-and-patch blindly
- Understand what every import is used for before removing it
- Run `tsc --noEmit` after changes to catch type errors before running tests
- Run the relevant unit tests after changes
- If you change a repository interface, update all implementations and all mocks

### When adding a new Drizzle table

1. Create the schema file in `packages/core/db/schema/`
2. Add the export to `packages/core/db/schema/index.ts`
3. Run `pnpm drizzle-kit generate` to create the migration
4. Review the generated migration SQL before committing
5. Add the repository interface to `packages/core/types/repositories.ts`
6. Implement the repository in `apps/api/src/repositories/`
7. Add the repository to `container.ts`

---

## 17. Dos

- **Do** read `CMS_PRD.md` before implementing any non-trivial feature
- **Do** work in dependency order (schema → types → validators → repository → service → controller → handler)
- **Do** write the repository interface before the implementation
- **Do** throw typed errors from `packages/core/errors/` in services and controllers
- **Do** use `crypto.randomUUID()` for all generated IDs before DB insert
- **Do** validate MIME types server-side on all file upload endpoints
- **Do** use constant-time comparison (`crypto.timingSafeEqual`) for all signature/token checks
- **Do** invalidate Redis cache keys when the underlying data changes
- **Do** add `site_id` to every new tenant-scoped table
- **Do** add the required composite indexes to every new table
- **Do** use Drizzle's `$inferSelect` and `$inferInsert` for DB types
- **Do** use `z.infer<typeof Schema>` for Zod-derived types
- **Do** keep Chakra UI imports strictly inside `apps/web/components/admin/` and `apps/web/app/(admin)/`
- **Do** use `@fluxmedia/react`'s `useMediaUpload` hook for all editor file uploads
- **Do** use the Hono RPC client in the frontend — never raw `fetch` with hardcoded URLs
- **Do** write unit tests for every service method you add or modify
- **Do** sanitize rich text HTML before storing with `isomorphic-dompurify`
- **Do** store the Tiptap JSON (`lexical` column) as the source of truth for post content
- **Do** use `satisfies` over `as` for type assertions
- **Do** run `tsc --noEmit` before marking a task complete
- **Do** keep the `container.ts` as the single place where all dependencies are wired

---

## 18. Do Nots

### Architecture violations

- **Do not** import `@cms/core/db/client` anywhere except repository files
- **Do not** import repository classes anywhere except `container.ts`
- **Do not** import Hono types (`Context`, `Hono`) anywhere except handlers, routes, and middleware
- **Do not** import Stripe, Resend, BullMQ, or any external SDK anywhere except provider adapter files
- **Do not** call `new PostService()` or `new PostRepository()` outside `container.ts`
- **Do not** call Next.js Server Actions or `use server` functions to access the DB directly
- **Do not** write business logic in controllers — they orchestrate, services decide
- **Do not** write Drizzle queries in services — repositories query, services call repositories

### TypeScript violations

- **Do not** use `any` — not even temporarily
- **Do not** use `@ts-ignore`
- **Do not** use `as SomeType` without a runtime check proving the assertion is safe
- **Do not** write manual TypeScript interfaces that duplicate Drizzle or Zod-inferred types
- **Do not** use the `enum` keyword — use `const` objects with `as const`
- **Do not** leave implicit `any` return types on async functions

### Security violations

- **Do not** source `site_id` from URL params, query strings, or request body
- **Do not** store plaintext secrets, OAuth credentials, or webhook secrets in the DB
- **Do not** use `===` to compare tokens or signatures — use `crypto.timingSafeEqual`
- **Do not** trust `Content-Type` headers or file extensions for upload validation
- **Do not** log request bodies on auth endpoints
- **Do not** commit secrets or hardcode API keys
- **Do not** return data across tenant boundaries

### Quality violations

- **Do not** leave TODOs, stubs, or `// implement later` comments in committed code
- **Do not** write unbounded DB queries without an explicit `limit`
- **Do not** use raw `<img>` tags — use `next/image`
- **Do not** import all Tiptap extensions statically — use dynamic imports
- **Do not** make N+1 queries — use joins or batch queries
- **Do not** use raw `fetch()` with hardcoded URL strings in the frontend — use the Hono RPC client
- **Do not** put Chakra UI imports in theme components or the public site route group
- **Do not** store hand-crafted HTML in the `lexical` column — it's Tiptap JSON only
- **Do not** use `console.log` for application logging — use the `logger` utility
- **Do not** edit committed migration files — create new ones

---

## 19. When You Are Unsure

**Unsure about a business rule?** → Read the relevant PRD section. If the PRD is silent, implement the most conservative/safe option and add a comment referencing the open question.

**Unsure about which layer a piece of logic belongs in?** → Ask: "Does this logic decide _what_ to do?" (service) or "Does it know _how to store_ something?" (repository) or "Does it know _how to respond over HTTP_?" (handler).

**Unsure whether to refactor or rewrite a file?** → If the file violates a Prime Directive (Section 2), rewrite it. If it's just messy but architecturally sound, refactor it.

**Unsure about a type?** → Derive it from Drizzle (`$inferSelect`) or Zod (`z.infer`) rather than guessing. If you truly cannot derive it, write it explicitly and add a comment explaining where the shape comes from.

**Unsure about caching?** → When in doubt, cache it. Use the TTLs from PRD Section 23.1. Always invalidate on write.

**Unsure about a security decision?** → Default to the more restrictive option. Security is not configurable at the expense of correctness.

**Unsure whether a feature is in scope?** → Check PRD Section 2 (Goals & Non-Goals). If it's listed under Non-Goals, do not implement it.

---

## 20. Checklist Before Completing Any Task

Before marking any task as done, verify every item below:

```
Architecture
[ ] No DB access outside repository files
[ ] No HTTP imports outside handlers and middleware
[ ] No SDK imports outside provider adapter files
[ ] site_id sourced from session/context, not from client input
[ ] All new classes instantiated only in container.ts

TypeScript
[ ] tsc --noEmit passes with zero errors
[ ] No `any`, no `@ts-ignore`
[ ] All new Zod schemas are in packages/core/validators/
[ ] All new domain types are in packages/core/types/
[ ] All new Drizzle types use $inferSelect / $inferInsert

Database
[ ] New tables have site_id (if tenant-scoped)
[ ] New tables have created_at and updated_at
[ ] New tables have the required composite indexes
[ ] Migration file generated and reviewed (not edited after generation)
[ ] No unbounded queries (every list query has a limit)

Security
[ ] All inputs validated with Zod at the handler layer
[ ] Sensitive data not logged
[ ] Secrets not hardcoded
[ ] Signatures compared with crypto.timingSafeEqual
[ ] File uploads validated by MIME type server-side

Quality
[ ] No TODOs or stubs in committed code
[ ] Unit tests written for all new service methods
[ ] Cache invalidated for any data that was modified
[ ] next/image used for all image rendering
[ ] Hono RPC client used for all frontend API calls (no raw fetch)
[ ] Chakra UI not imported outside admin scope
[ ] Logger used instead of console.log
```

---

_This file is authoritative for AI agents working on this codebase._
_Keep it up to date whenever architectural decisions change._
_When in doubt: read the PRD, follow the Prime Directives, ask._

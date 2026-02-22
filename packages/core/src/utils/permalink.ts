/**
 * packages/core/src/utils/permalink.ts
 *
 * Permalink resolution algorithm (PRD §10.2).
 * Pure function — no DB access, no external dependencies.
 */

import type { Post } from "../db/schema/posts.js";
import type { Tag } from "../db/schema/posts.js";

/** Supported permalink pattern tokens */
export type PermalinkPattern =
  | "/:slug"
  | "/:category/:slug"
  | "/:year/:month/:day/:slug"
  | "/:year/:month/:slug"
  | "/:year/:slug";

const DEFAULT_PATTERN: PermalinkPattern = "/:slug";

/**
 * Resolves a post's permalink according to the active site pattern.
 * Stored denormalized on the post record at publish time.
 *
 * @param post - The post record (must have publishedAt and slug)
 * @param pattern - The site's active permalink_pattern
 * @param primaryTagSlug - Slug of the first public tag (used for :category token)
 */
export function resolvePermalink(
  post: Pick<Post, "slug" | "published_at">,
  pattern: PermalinkPattern | string = DEFAULT_PATTERN,
  primaryTagSlug?: string
): string {
  const date = post.published_at ?? new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const category = primaryTagSlug ?? "uncategorized";

  const resolved = (pattern as string)
    .replace(":year", year)
    .replace(":month", month)
    .replace(":day", day)
    .replace(":category", category)
    .replace(":slug", post.slug);

  // Ensure single leading slash, no trailing slash
  return "/" + resolved.replace(/^\/+/, "").replace(/\/+$/, "");
}

/**
 * Generates a URL-safe slug from arbitrary text.
 * Handles Unicode by normalizing to NFC then stripping diacritics.
 */
export function generateSlug(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars except hyphens
    .replace(/[\s_]+/g, "-") // Spaces and underscores to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Strip leading/trailing hyphens
}

/**
 * Appends a numeric suffix to make a slug unique.
 * e.g. "my-post" → "my-post-2" → "my-post-3"
 */
export function appendSlugSuffix(slug: string, attempt: number): string {
  if (attempt <= 1) return slug;
  return `${slug}-${attempt}`;
}

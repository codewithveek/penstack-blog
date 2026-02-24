/**
 * apps/web/src/lib/mappers.ts
 *
 * Transform raw API response data into ThemePostContext, ThemeAuthorContext,
 * and ThemeTagContext shapes that theme components consume.
 *
 * The API returns Drizzle DB types with snake_case fields. Theme components
 * expect camelCase fields plus computed properties like `url`, `primaryAuthor`,
 * and `primaryTag`.
 */

import type {
  ThemePostContext,
  ThemeAuthorContext,
  ThemeTagContext,
} from "@cms/core/types/theme";

// ---------------------------------------------------------------------------
// Raw API types (what the API actually returns)
// ---------------------------------------------------------------------------

interface RawApiUser {
  id: string;
  site_id: string;
  name: string;
  email: string;
  slug: string;
  role: string;
  bio?: string | null;
  image?: string | null;
  cover_image?: string | null;
  website?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  location?: string | null;
  [key: string]: unknown;
}

interface RawApiTag {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description?: string | null;
  feature_image?: string | null;
  visibility?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

interface RawApiPostAuthor {
  user: RawApiUser;
  role: string;
  sort_order: number;
}

interface RawApiPost {
  id: string;
  site_id: string;
  type: string;
  title: string;
  slug: string;
  permalink?: string | null;
  html?: string | null;
  excerpt?: string | null;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  status: string;
  visibility: string;
  reading_time_minutes?: number | null;
  published_at?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  canonical_url?: string | null;
  custom_head_code?: string | null;
  custom_foot_code?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  authors?: RawApiPostAuthor[];
  tags?: RawApiTag[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Mapper: Raw API User → ThemeAuthorContext
// ---------------------------------------------------------------------------

export function mapAuthor(raw: RawApiUser): ThemeAuthorContext {
  const author: ThemeAuthorContext = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    url: `/author/${raw.slug}/`,
  };
  if (raw.bio) author.bio = raw.bio;
  if (raw.image) author.avatar = raw.image;
  if (raw.website) author.website = raw.website;
  if (raw.twitter) author.twitter = raw.twitter;
  if (raw.facebook) author.facebook = raw.facebook;
  if (raw.location) author.location = raw.location;
  return author;
}

// ---------------------------------------------------------------------------
// Mapper: Raw API Tag → ThemeTagContext
// ---------------------------------------------------------------------------

export function mapTag(raw: RawApiTag): ThemeTagContext {
  const tag: ThemeTagContext = {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    url: `/tag/${raw.slug}/`,
  };
  if (raw.description) tag.description = raw.description;
  if (raw.feature_image) tag.featureImage = raw.feature_image;
  return tag;
}

// ---------------------------------------------------------------------------
// Mapper: Raw API Post → ThemePostContext
// ---------------------------------------------------------------------------

export function mapPost(raw: RawApiPost): ThemePostContext {
  const authors: ThemeAuthorContext[] = (raw.authors ?? []).map((a) =>
    mapAuthor(a.user)
  );
  const primaryAuthorEntry = (raw.authors ?? []).find(
    (a) => a.role === "primary"
  );
  const primaryAuthor: ThemeAuthorContext = primaryAuthorEntry
    ? mapAuthor(primaryAuthorEntry.user)
    : authors[0] ?? {
        id: "",
        name: "Unknown",
        slug: "unknown",
        url: "/author/unknown/",
      };

  const tags: ThemeTagContext[] = (raw.tags ?? []).map(mapTag);
  const primaryTag = tags[0];

  const og: ThemePostContext["og"] = {};
  if (raw.og_title) og.title = raw.og_title;
  if (raw.og_description) og.description = raw.og_description;
  if (raw.og_image) og.image = raw.og_image;

  const twitter: ThemePostContext["twitter"] = {};
  if (raw.twitter_title) twitter.title = raw.twitter_title;
  if (raw.twitter_description) twitter.description = raw.twitter_description;
  if (raw.twitter_image) twitter.image = raw.twitter_image;

  const post: ThemePostContext = {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    url: raw.permalink ?? `/${raw.slug}/`,
    html: raw.html ?? "",
    updatedAt: raw.updated_at ?? new Date().toISOString(),
    readingTimeMinutes: raw.reading_time_minutes ?? 0,
    visibility: (raw.visibility as "public" | "members" | "paid") ?? "public",
    type: (raw.type as "post" | "page") ?? "post",
    authors,
    primaryAuthor,
    tags,
    og,
    twitter,
  };

  if (raw.excerpt) post.excerpt = raw.excerpt;
  if (raw.featured_image) post.featureImage = raw.featured_image;
  if (raw.featured_image_alt) post.featureImageAlt = raw.featured_image_alt;
  if (raw.published_at) post.publishedAt = raw.published_at;
  if (primaryTag) post.primaryTag = primaryTag;
  if (raw.canonical_url) post.canonical = raw.canonical_url;

  if (raw.custom_head_code || raw.custom_foot_code) {
    const codeInjection: NonNullable<ThemePostContext["codeInjection"]> = {};
    if (raw.custom_head_code) codeInjection.head = raw.custom_head_code;
    if (raw.custom_foot_code) codeInjection.foot = raw.custom_foot_code;
    post.codeInjection = codeInjection;
  }

  return post;
}

// ---------------------------------------------------------------------------
// Batch mappers for list responses
// ---------------------------------------------------------------------------

export function mapPosts(rawPosts: RawApiPost[]): ThemePostContext[] {
  return rawPosts.map(mapPost);
}

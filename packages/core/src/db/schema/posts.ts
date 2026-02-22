/**
 * packages/core/src/db/schema/posts.ts
 *
 * Core content tables: posts (covers both posts and pages), post_authors,
 * tags, and the post_tags join table.
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  uniqueIndex,
  index,
  json,
} from "drizzle-orm/mysql-core";
import {
  id,
  createdAt,
  updatedAt,
  deletedAt,
  siteIdCol,
  postStatusEnum,
  postTypeEnum,
  postVisibilityEnum,
  authorRoleEnum,
} from "./helpers.js";
import { sites } from "./sites.js";
import { users } from "./users.js";

// ---------------------------------------------------------------------------
// Posts (type: 'post' | 'page')
// ---------------------------------------------------------------------------

export const posts = mysqlTable(
  "posts",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    type: postTypeEnum.notNull().default("post"),
    title: varchar("title", { length: 2000 }).notNull(),
    slug: varchar("slug", { length: 2000 }).notNull(),
    /**
     * Denormalized resolved permalink (stored at publish time using the site's
     * active permalink_pattern). Never recomputed on read.
     */
    permalink: varchar("permalink", { length: 2000 }),
    /**
     * Tiptap JSON stored here (the canonical source of truth).
     * html column is a derived render cache.
     */
    lexical: json("lexical"),
    html: text("html"),
    excerpt: text("excerpt"),
    featured_image: text("featured_image"),
    featured_image_alt: varchar("featured_image_alt", { length: 512 }),
    status: postStatusEnum.notNull().default("draft"),
    visibility: postVisibilityEnum.notNull().default("public"),
    /** Estimated reading time in minutes */
    reading_time_minutes: int("reading_time_minutes").default(0),
    /** Allow comments (pluggable comment system) */
    allow_comments: boolean("allow_comments").default(true).notNull(),
    /** Whether to queue this post for newsletter email when published */
    send_newsletter: boolean("send_newsletter").default(false).notNull(),
    /** Scheduled publish timestamp */
    scheduled_at: timestamp("scheduled_at"),
    published_at: timestamp("published_at"),
    /** Per-post code injection */
    custom_head_code: text("custom_head_code"),
    custom_foot_code: text("custom_foot_code"),
    /** SEO fields */
    og_title: varchar("og_title", { length: 2000 }),
    og_description: text("og_description"),
    og_image: text("og_image"),
    twitter_title: varchar("twitter_title", { length: 2000 }),
    twitter_description: text("twitter_description"),
    twitter_image: text("twitter_image"),
    canonical_url: text("canonical_url"),
    /** Associated newsletter (for email sending) */
    newsletter_id: varchar("newsletter_id", { length: 36 }),
    created_at: createdAt(),
    updated_at: updatedAt(),
    deleted_at: deletedAt(),
  },
  (t) => ({
    siteIdIdx: index("posts_site_id").on(t.site_id),
    siteSlugIdx: uniqueIndex("posts_site_slug_unique").on(t.site_id, t.slug),
    sitePermalinkIdx: uniqueIndex("posts_site_permalink_unique").on(
      t.site_id,
      t.permalink
    ),
    statusIdx: index("posts_status").on(t.site_id, t.status),
    typeIdx: index("posts_type").on(t.site_id, t.type),
    publishedAtIdx: index("posts_published_at").on(t.site_id, t.published_at),
    visibilityIdx: index("posts_visibility").on(t.site_id, t.visibility),
    scheduledIdx: index("posts_scheduled").on(t.status, t.scheduled_at),
    /** TiDB full-text search on title and html */
    titleHtmlFulltext: index("posts_title_html_fulltext").on(t.title, t.html)

  })
);

// ---------------------------------------------------------------------------
// Post authors (many-to-many with role)
// ---------------------------------------------------------------------------

export const postAuthors = mysqlTable(
  "post_authors",
  {
    post_id: varchar("post_id", { length: 36 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    user_id: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: authorRoleEnum.notNull().default("primary"),
    sort_order: int("sort_order").notNull().default(0),
  },
  (t) => ({
    // composite PK
    pk: uniqueIndex("post_authors_pk").on(t.post_id, t.user_id),
    userIdx: index("post_authors_user_id").on(t.user_id),
  })
);

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const tags = mysqlTable(
  "tags",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    feature_image: text("feature_image"),
    /** Internal tags start with # and are not shown publicly */
    visibility: varchar("visibility", { length: 16 })
      .default("public")
      .notNull(),
    og_title: varchar("og_title", { length: 2000 }),
    og_description: text("og_description"),
    og_image: text("og_image"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    siteSlugIdx: uniqueIndex("tags_site_slug_unique").on(t.site_id, t.slug),
    siteIdx: index("tags_site_id").on(t.site_id),
  })
);

// ---------------------------------------------------------------------------
// Post–tag join table
// ---------------------------------------------------------------------------

export const postTags = mysqlTable(
  "post_tags",
  {
    post_id: varchar("post_id", { length: 36 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tag_id: varchar("tag_id", { length: 36 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    sort_order: int("sort_order").notNull().default(0),
  },
  (t) => ({
    pk: uniqueIndex("post_tags_pk").on(t.post_id, t.tag_id),
    tagIdx: index("post_tags_tag_id").on(t.tag_id),
  })
);

// ---------------------------------------------------------------------------
// Post analytics
// ---------------------------------------------------------------------------

export const postViews = mysqlTable(
  "post_views",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    post_id: varchar("post_id", { length: 36 })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    /** null for anonymous visitors */
    member_id: varchar("member_id", { length: 36 }),
    ip_hash: varchar("ip_hash", { length: 64 }),
    user_agent_hash: varchar("user_agent_hash", { length: 64 }),
    referrer: varchar("referrer", { length: 2048 }),
    country: varchar("country", { length: 4 }),
    device_type: varchar("device_type", { length: 32 }),
    viewed_at: timestamp("viewed_at").notNull(),
  },
  (t) => ({
    sitePostIdx: index("post_views_site_post").on(t.site_id, t.post_id),
    viewedAtIdx: index("post_views_viewed_at").on(t.viewed_at),
  })
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostAuthor = typeof postAuthors.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type PostTag = typeof postTags.$inferSelect;
export type PostView = typeof postViews.$inferSelect;

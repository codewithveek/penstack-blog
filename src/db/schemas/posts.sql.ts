import { IdGenerator } from "@/utils";
import { relations, sql } from "drizzle-orm";
import {
  mysqlTable,
  int,
  varchar,
  longtext,
  timestamp,
  mysqlEnum,
  text,
  boolean,
  uniqueIndex,
  index,
  json,
} from "drizzle-orm/mysql-core";
import { users } from "./users.sql";
import { medias } from "./media.sql";
import { postViews } from "./posts-analytics.sql";
import { postReactions } from "./posts-reactions.sql";
import { id, created_at, updated_at } from "../schema-helper";
import { TocItem } from "@/lib/toc-generator";

export const posts = mysqlTable(
  "Posts",
  {
    id,
    title: varchar("title", { length: 255 }).notNull(),
    content: longtext("content"),
    summary: varchar("summary", { length: 500 }),
    seo_meta_id: int("meta_id"),
    generate_toc: boolean("generate_toc").default(true),
    toc_depth: int("toc_depth").default(2),
    toc: json("toc").$type<TocItem[]>(),
    post_id: varchar("post_id", { length: 255 })
      .default(sql`(UUID())`)
      .unique()
      .notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    status: mysqlEnum("status", ["draft", "published", "deleted"]).default(
      "draft"
    ),
    scheduled_at: timestamp("scheduled_at"),
    schedule_id: varchar("schedule_id", { length: 50 }),
    author_id: varchar("author_id", { length: 100 }).notNull(),
    visibility: mysqlEnum("visibility", ["public", "private"]).default(
      "public"
    ),
    category_id: int("category_id"),
    is_sticky: boolean("is_sticky").default(false),
    reading_time: int("reading_time"),
    allow_comments: boolean("allow_comments").default(false),
    send_newsletter: boolean("send_newsletter").default(true),
    newsletter_sent_at: timestamp("newsletter_sent_at"),
    featured_image_id: int("featured_image_id"),
    created_at,
    published_at: timestamp("published_at"),
    updated_at,
  },
  (table) => ({
    idxTitle: index("idx_title_summary").on(table.title, table.summary),
    idxPostId: uniqueIndex("idx_post_id").on(table.post_id),
    idxStatus: index("idx_status").on(table.status),
    idxSlug: uniqueIndex("idx_slug").on(table.slug),
    idxAuthor: index("idx_author").on(table.author_id),
    idxCategory: index("idx_category").on(table.category_id),
    idxCreatedAt: index("idx_created_at").on(table.created_at),
    idxPublishedAt: index("idx_published_at").on(table.published_at),
  })
);

export const postSeoMeta = mysqlTable(
  "PostSeoMeta",
  {
    id,
    post_id: int("post_id").notNull().unique(),
    title: varchar("title", { length: 150 }),
    canonical_url: varchar("canonical_url", { length: 255 }),
    description: varchar("description", { length: 255 }),
    image: varchar("image", { length: 255 }),
    keywords: varchar("keywords", { length: 255 }),
    created_at,
    updated_at,
  },
  (table) => ({
    idxSeoTitle: index("idx_seo_title").on(table.title),
    idxSeoCanonicalUrl: index("idx_seo_canonical_url").on(table.canonical_url),
    idxPostId: uniqueIndex("idx_post_id").on(table.post_id),
  })
);

export const categories = mysqlTable(
  "Categories",
  {
    id,
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    created_at,
    updated_at,
  },
  (table) => ({
    idxName: index("idx_name").on(table.name),
    idxSlug: uniqueIndex("idx_slug").on(table.slug),
  })
);

export const tags = mysqlTable(
  "Tags",
  {
    id,
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    created_at,
    updated_at,
  },
  (table) => ({
    idxName: index("idx_name").on(table.name),
    idxSlug: uniqueIndex("idx_slug").on(table.slug),
  })
);

export const postTags = mysqlTable(
  "PostTags",
  {
    post_id: int("post_id").notNull(),
    tag_id: int("tag_id").notNull(),
  },
  (table) => ({
    idxPostTag: index("idx_post_tag").on(table.post_id, table.tag_id),
  })
);

export const comments = mysqlTable(
  "Comments",
  {
    id,
    content: text("content"),
    status: mysqlEnum("status", [
      "approved",
      "pending",
      "disapproved",
      "deleted",
    ]).default("pending"),
    post_id: int("post_id").notNull(),
    author_id: varchar("author_id", { length: 100 }).notNull(),
    created_at,
    updated_at,
  },
  (table) => ({
    idxStatus: index("idx_status").on(table.status),
    idxPostId: index("idx_post_id").on(table.post_id),
    idxAuthorId: index("idx_author_id").on(table.author_id),
    idxCreatedAt: index("idx_created_at").on(table.created_at),
  })
);

export const replies = mysqlTable(
  "Replies",
  {
    id,
    content: text("content"),
    status: mysqlEnum("status", [
      "approved",
      "pending",
      "disapproved",
      "deleted",
    ]).default("pending"),
    comment_id: int("comment_id").notNull(),
    author_id: varchar("author_id", { length: 100 }).notNull(),
    created_at,
    updated_at,
  },
  (table) => ({
    idxStatus: index("idx_status").on(table.status),
    idxCommentId: index("idx_comment_id").on(table.comment_id),
    idxAuthorId: index("idx_author_id").on(table.author_id),
    idxCreatedAt: index("idx_created_at").on(table.created_at),
  })
);
export const postMetaRelations = relations(postSeoMeta, ({ one }) => ({
  post: one(posts, { fields: [postSeoMeta.post_id], references: [posts.id] }),
}));
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.author_id],
    references: [users.auth_id],
  }),
  views: many(postViews),
  reactions: many(postReactions),
  seoMeta: one(postSeoMeta, {
    fields: [posts.seo_meta_id],
    references: [postSeoMeta.id],
  }),
  featured_image: one(medias, {
    fields: [posts.featured_image_id],
    references: [medias.id],
  }),
  comments: many(comments),
  category: one(categories, {
    fields: [posts.category_id],
    references: [categories.id],
  }),
  tags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.post_id], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tag_id], references: [tags.id] }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.auth_id],
  }),
  post: one(posts, { fields: [comments.post_id], references: [posts.id] }),
  replies: many(replies),
}));

export const repliesRelations = relations(replies, ({ one }) => ({
  author: one(users, {
    fields: [replies.author_id],
    references: [users.auth_id],
  }),
  parentComment: one(comments, {
    fields: [replies.comment_id],
    references: [comments.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

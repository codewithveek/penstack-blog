import { IdGenerator } from "@/src/utils";
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
} from "drizzle-orm/mysql-core";
import { users } from "./users.sql";
import { medias } from "./media.sql";
import { postViews } from "./posts-analytics.sql";
import { postReactions } from "./posts-reactions.sql";
import { id, created_at, updated_at } from "../schema-helper";

export const posts = mysqlTable(
  "Posts",
  {
    id,
    title: varchar("title", { length: 255 }),
    content: longtext("content"),
    summary: varchar("summary", { length: 500 }),
    seo_meta_id: int("meta_id"),
    post_id: varchar("post_id", { length: 255 })
      .$defaultFn(() => IdGenerator.uuid())
      .unique()
      .notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    status: mysqlEnum("status", ["draft", "published", "deleted"]).default(
      "draft"
    ),
    scheduled_at: timestamp("scheduled_at"),
    schedule_id: varchar("schedule_id", { length: 50 }),
    author_id: varchar("author_id", { length: 100 }).notNull(),
    visibility: mysqlEnum("visibility", ["public", "members", "private"]).default(
      "public"
    ),
    category_id: int("category_id"),
    is_sticky: boolean("is_sticky").default(false), // For pinned posts
    reading_time: int("reading_time"),
    allow_comments: boolean("allow_comments").default(false),
    send_newsletter: boolean("send_newsletter").default(true),
    newsletter_sent_at: timestamp("newsletter_sent_at"),
    access_password: varchar("access_password", { length: 255 }),
    featured_image_id: int("featured_image_id"),
    created_at,
    published_at: timestamp("published_at").generatedAlwaysAs(
      sql`(
        CASE 
            WHEN status = 'published' THEN updated_at
            ELSE NULL
        END
    )`,
      { mode: "stored" }
    ),
    updated_at: timestamp("updated_at").onUpdateNow().defaultNow(),
  },
  (table) => {
    return {
      idxTitle: index("idx_title_summary").on(table.title, table.summary),
      idxPostId: uniqueIndex("idx_post_id").on(table.post_id),

      idxStatus: index("idx_status").on(table.status),
      uniqueIndex: uniqueIndex("slug_unique_index").on(table.slug),
    };
  }
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.author_id],
    references: [users.auth_id],
  }),
  views: many(postViews),
  reactions: many(postReactions),
  seoMeta: one(postSeoMeta, {
    fields: [posts.seo_meta_id],
    references: [postSeoMeta.post_id],
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
export const postSeoMeta = mysqlTable(
  "PostSeoMeta",
  {
    id,
    post_id: int("post_id").notNull(),
    title: varchar("title", { length: 150 }),
    canonical_url: varchar("canonical_url", { length: 255 }),
    description: varchar("description", { length: 255 }),
  },
  (table) => ({
    idxSeoTitle: index("idx_seo_title").on(table.title),
    idxSeoCanonicalUrl: index("idx_seo_canonical_url").on(table.canonical_url),
  })
);
export const postMetaRelations = relations(postSeoMeta, ({ one }) => ({
  post: one(posts, {
    fields: [postSeoMeta.post_id],
    references: [posts.id],
  }),
}));
export const categories = mysqlTable(
  "Categories",
  {
    id,
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 500 }),
    created_at,
    updated_at,
  },
  (table) => {
    return {
      nameIdx: index("name_index").on(table.name),
      slugUniqueIndex: uniqueIndex("slug_unique_index").on(table.slug),
    };
  }
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  posts: many(posts),
}));

export const tags = mysqlTable(
  "Tags",
  {
    id,
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 500 }),
    created_at,
    updated_at,
  },
  (table) => {
    return {
      nameIdx: index("name_index").on(table.name),
      slugUniqueIndex: uniqueIndex("slug_unique_index").on(table.slug),
    };
  }
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
  posts: many(postTags),
}));

export const postTags = mysqlTable("PostTags", {
  post_id: int("post_id").notNull(),
  tag_id: int("tag_id").notNull(),
});

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.post_id],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tag_id],
    references: [tags.id],
  }),
}));

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
  })
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.auth_id],
  }),
  post: one(posts, {
    fields: [comments.post_id],
    references: [posts.id],
  }),
  replies: many(replies),
}));

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
  })
);

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

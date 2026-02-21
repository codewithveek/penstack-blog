import { relations } from "drizzle-orm";
import {
  index,
  int,
  longtext,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";
import { id, created_at } from "../schema-helper";
import { posts } from "./posts.sql";
import { users } from "./users.sql";

/**
 * Stores a snapshot of post content each time a post is updated.
 * Enables revision history similar to Ghost CMS.
 *
 * `revision_number` is auto-incremented by the database to avoid race
 * conditions when concurrent requests update the same post simultaneously.
 */
export const postRevisions = mysqlTable(
  "PostRevisions",
  {
    id,
    post_id: int("post_id").notNull(),
    title: varchar("title", { length: 255 }),
    content: longtext("content"),
    summary: varchar("summary", { length: 500 }),
    // DB-level auto-increment ensures unique, monotonically increasing
    // revision numbers without application-level locking.
    revision_number: int("revision_number").autoincrement().notNull(),
    revised_by: varchar("revised_by", { length: 100 }).notNull(),
    created_at,
  },
  (table) => ({
    idxPostId: index("idx_revision_post_id").on(table.post_id),
    idxRevisedBy: index("idx_revision_revised_by").on(table.revised_by),
  })
);

export const postRevisionsRelations = relations(postRevisions, ({ one }) => ({
  post: one(posts, {
    fields: [postRevisions.post_id],
    references: [posts.id],
  }),
  revisedBy: one(users, {
    fields: [postRevisions.revised_by],
    references: [users.auth_id],
  }),
}));

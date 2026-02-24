/**
 * packages/core/src/db/schema/media.ts
 *
 * Media assets uploaded through FluxMedia. Tracks metadata and the
 * storage provider URL. The actual binary is stored by the provider
 * (Cloudinary, S3, R2) — this table only stores references.
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
} from "drizzle-orm/mysql-core";
import {
  id,
  createdAt,
  updatedAt,
  siteIdCol,
  mediaTypeEnum,
} from "./helpers.sql.js";
import { sites } from "./sites.sql.js";
import { users } from "./users.sql.js";

export const mediaAssets = mysqlTable(
  "media_assets",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    /** ID returned by the storage provider (e.g. Cloudinary public_id) */
    provider_id: varchar("provider_id", { length: 512 }),
    /** Name of the storage provider: cloudinary | s3 | r2 */
    provider: varchar("provider", { length: 32 }).notNull(),
    /** Stable public URL */
    url: text("url").notNull(),
    /** CDN or optimized thumbnail URL */
    thumbnail_url: text("thumbnail_url"),
    original_filename: varchar("original_filename", { length: 512 }),
    type: mediaTypeEnum.notNull().default("image"),
    mime_type: varchar("mime_type", { length: 127 }),
    /** File size in bytes */
    size_bytes: int("size_bytes"),
    width: int("width"),
    height: int("height"),
    alt_text: varchar("alt_text", { length: 512 }),
    caption: text("caption"),
    /** Logical folder path (virtual, not a real filesystem folder) */
    folder: varchar("folder", { length: 512 }).default("/").notNull(),
    uploaded_by_id: varchar("uploaded_by_id", { length: 36 }).references(
      () => users.id,
      { onDelete: "set null" }
    ),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    siteIdx: index("media_assets_site_id").on(t.site_id),
    siteCreatedIdx: index("media_assets_site_created").on(
      t.site_id,
      t.created_at
    ),
    siteTypeIdx: index("media_assets_site_type").on(t.site_id, t.type),
    siteFolderIdx: index("media_assets_site_folder").on(t.site_id, t.folder),
  })
);

export type MediaAsset = typeof mediaAssets.$inferSelect;
export type NewMediaAsset = typeof mediaAssets.$inferInsert;

import "server-only";
import { db } from "@/db";
import { tags, postTags, posts } from "@/db/schemas/posts.sql";
import { sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const queryTagsWithFilters = unstable_cache(
  async function ({
    page = 1,
    limit = 20,
    sort = "name",
    hasPostsOnly = false,
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    sort?: string;
    hasPostsOnly?: boolean;
    sortOrder?: "asc" | "desc";
  }) {
    const validatedPage = Math.max(Number(page), 1);
    const validatedLimit = Math.min(Number(limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;
    const validSort = ["name", "popular"].includes(sort) ? sort : "name";
    const validSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : "desc";

    try {
      // Base query for tags with post count
      const tagsWithCount = db.$with("tagsWithCount").as(
        db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
            postCount: sql<number>`count(${postTags.post_id})`.as("post_count"),
          })
          .from(tags)
          .leftJoin(postTags, sql`${postTags.tag_id} = ${tags.id}`)
          .groupBy(tags.id)
      );

      // Get total count
      const filteredTags = hasPostsOnly
        ? db
            .with(tagsWithCount)
            .select()
            .from(tagsWithCount)
            .where(sql`post_count > 0`)
        : db.with(tagsWithCount).select().from(tagsWithCount);

      const total = await filteredTags.execute();

      // Get paginated results
      const results = await db
        .with(tagsWithCount)
        .select()
        .from(tagsWithCount)
        .where(hasPostsOnly ? sql`post_count > 0` : undefined)
        .orderBy(
          validSort === "popular"
            ? validSortOrder === "desc"
              ? sql`post_count DESC`
              : sql`post_count ASC`
            : validSortOrder === "desc"
              ? sql`name DESC`
              : sql`name ASC`
        )
        .limit(validatedLimit)
        .offset(offset);

      return {
        data: results,
        meta: {
          total: total.length,
          page: validatedPage,
          limit: validatedLimit,
          totalPages: Math.ceil(total.length / validatedLimit),
        },
      };
    } catch (error) {
      console.error("Tags query error:", error);
      throw error;
    }
  },
  ["queryTagsWithFilters"],
  { tags: ["queryTagsWithFilters"] }
);

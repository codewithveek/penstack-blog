import "server-only";
import { db } from "@/db";
import { categories, posts } from "@/db/schemas/posts.sql";
import { and, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const queryCategoriesWithFilters = unstable_cache(
  async function ({
    page = 1,
    limit = 20,
    sortBy = "name",
    hasPostsOnly = false,
    sortOrder = "desc",
  }: {
    page?: number;
    limit?: number;
    sortBy?: string;
    hasPostsOnly?: boolean;
    sortOrder?: "asc" | "desc";
  }) {
    const validatedPage = Math.max(Number(page), 1);
    const validatedLimit = Math.min(Number(limit), 100);
    const offset = (validatedPage - 1) * validatedLimit;
    const validSort = ["name", "popular"].includes(sortBy) ? sortBy : "name";
    const validSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : "desc";

    try {
      // Base query for categories with post count
      const categoriesWithCount = db.$with("categoriesWithCount").as(
        db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            postCount: sql<number>`count(${posts.id})`.as("post_count"),
          })
          .from(categories)
          .leftJoin(
            posts,
            and(
              eq(posts.category_id, categories.id),
              eq(posts.status, "published")
            )
          )
          .groupBy(categories.id)
      );

      // Get total count
      const filteredCategories = hasPostsOnly
        ? db
            .with(categoriesWithCount)
            .select()
            .from(categoriesWithCount)
            .where(sql`post_count > 0`)
        : db.with(categoriesWithCount).select().from(categoriesWithCount);

      const total = await filteredCategories.execute();

      // Get paginated results
      const results = await db
        .with(categoriesWithCount)
        .select()
        .from(categoriesWithCount)
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
      console.error("Category query error:", error);
      throw error;
    }
  },
  ["queryCategoriesWithFilters"],
  { tags: ["queryCategoriesWithFilters"], revalidate: 60 * 60 * 24 }
);

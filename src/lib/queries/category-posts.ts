import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { categories, posts } from "@/db/schemas";
import { eq, or, and } from "drizzle-orm";
import "server-only";

export const getPostsByCategory = unstable_cache(
  async ({
    categoryNameOrSlugOrId,
  }: {
    categoryNameOrSlugOrId: string | number;
  }) => {
    let query;
    if (typeof categoryNameOrSlugOrId === "number") {
      query = eq(categories.id, categoryNameOrSlugOrId);
    } else {
      query = or(
        eq(categories.slug, categoryNameOrSlugOrId),
        eq(categories.name, categoryNameOrSlugOrId)
      );
    }
    const category = await db.query.categories.findFirst({
      where: query,
      columns: {},
      with: {
        posts: {
          where: eq(posts.status, "published"),
          with: {
            featured_image: {
              columns: {
                url: true,
                id: true,
                caption: true,
                alt_text: true,
              },
            },
            category: {
              columns: {
                name: true,
                slug: true,
              },
            },
            author: {
              columns: {
                name: true,
                username: true,
                id: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return category?.posts;
  },
  ["getPostsByCategory"],
  {
    tags: ["getPostsByCategory"],
    revalidate: 60 * 60 * 24, // 24 hours
  }
);

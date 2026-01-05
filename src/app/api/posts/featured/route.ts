import { logger } from "@/lib/logger";
import { db } from "@/db";
import { posts } from "@/db/schemas";
import {
  getEngagementBasedFeaturedPosts,
  getPublishedPostsQuery,
} from "@/lib/queries/featured";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 14400; // revalidate every 4 hours

export async function GET(req: NextRequest) {
  try {
    const featuredPost = await db.query.posts.findFirst({
      where: getPublishedPostsQuery(),
      orderBy: [desc(posts.content)],
      columns: {
        author_id: false,
      },
      with: {
        featured_image: {
          columns: {
            url: true,
            alt_text: true,
            id: true,
            caption: true,
          },
        },
        category: {
          columns: {
            name: true,
            slug: true,
            id: true,
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
        tags: {
          with: {
            tag: {
              columns: {
                name: true,
                slug: true,
                id: true,
              },
            },
          },
        },
      },
    });
    const tags = featuredPost?.tags.map((t) => t.tag);

    const p = {
      ...featuredPost,
      tags,
    };
    return NextResponse.json({
      data: featuredPost,
      message: "Featured Post retrieved successfully",
    });
  } catch (error) {
    logger.debug("Error", error as any);

    return NextResponse.json({
      data: null,
      error,
      message: "Something went wrong...couldn't fetch featured post",
    });
  }
}

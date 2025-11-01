import { db } from "@/db";
import { posts } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { getSession } from "@/lib/auth/next-auth";
import { getPosts } from "@/lib/queries/posts";
import { parseHtmlHeadings } from "@/lib/toc-generator";
import { PostInsert } from "@/types";
import {
  calculateReadingTime,
  decodeAndSanitizeHtml,
  stripHtml,
} from "@/utils";
import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// export const revalidate = 3600; // revalidate every hour

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search") as string;
  const access = searchParams.get("access") as "dashboard" | "public";

  const status =
    (searchParams.get("status") as NonNullable<PostInsert["status"] | "all">) ||
    "published";
  const sortBy =
    (searchParams.get("sortBy") as "recent" | "published_at" | "popular") ||
    "recent";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
  const category = searchParams.get("category") as string;
  try {
    const results = await getPosts({
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
      category,
      access,
    });

    return NextResponse.json({
      ...results,
      message: "All posts fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        data: null,
        error: error?.message,
        message: "Something went wrong... could not fetch posts",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  await checkPermission({ requiredPermission: "posts:create" }, async () => {
    const { content, ...rest } = await req.json();

    try {
      const post = await db.transaction(async (tx) => {
        const [insertResponse] = await tx
          .insert(posts)
          .values({
            ...rest,

            reading_time: calculateReadingTime(
              stripHtml(decodeAndSanitizeHtml(content))
            ),
          })
          .$returningId();
        return await tx.query.posts.findFirst({
          where: eq(posts.id, insertResponse.id),
        });
      });

      return NextResponse.json({
        data: post,
        message: "Post created successfully",
      });
    } catch (error: any) {
      return NextResponse.json({
        data: null,
        error: error?.message,
        message: "Error creating post",
      });
    }
  });
}

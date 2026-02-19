import { db } from "@/db";
import { posts } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { getSession } from "@/lib/auth/session";
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
import { postCreateSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";

export const revalidate = 3600;

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
    logger.error("Error fetching posts", error, { page, limit, search });
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
    try {
      const body = await req.json();
      const validated = postCreateSchema.parse(body);
      const { content, scheduled_at, ...rest } = validated;

      const post = await db.transaction(async (tx) => {
        const [insertResponse] = await tx
          .insert(posts)
          .values({
            ...rest,
            content,
            scheduled_at: scheduled_at ? new Date(scheduled_at) : undefined,
            reading_time: calculateReadingTime(
              stripHtml(decodeAndSanitizeHtml(content || ""))
            ),
          })
          .$returningId();
        return await tx.query.posts.findFirst({
          where: eq(posts.id, insertResponse.id),
        });
      });

      logger.info("Post created successfully", {
        postId: post?.id,
        title: post?.title,
        authorId: rest.author_id
      });

      revalidatePath("/");
      revalidatePath("/posts");
      if (post?.slug) {
        revalidatePath(`/posts/${post.slug}`);
      }

      return NextResponse.json({
        data: post,
        message: "Post created successfully",
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        logger.warn("Post creation validation failed", { errors: error.issues });
        return NextResponse.json({
          data: null,
          message: "Validation failed",
          errors: error.issues,
        }, { status: 400 });
      }

      logger.error("Error creating post", error);
      return NextResponse.json({
        data: null,
        error: error?.message,
        message: "Error creating post",
      }, { status: 500 });
    }
  });
}

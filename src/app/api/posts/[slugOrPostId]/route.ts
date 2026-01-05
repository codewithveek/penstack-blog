import { logger } from "@/lib/logger";
import { db } from "@/db";
import { posts } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { getSession } from "@/lib/auth/next-auth";
import {
  getPlainPost,
  getPlainPostWithCache,
  getPost,
  getPostForEditing,
} from "@/lib/queries/post";
import { parseHtmlHeadings, TocItem } from "@/lib/toc-generator";
import {
  calculateReadingTime,
  decodeAndSanitizeHtml,
  stripHtml,
} from "@/utils";
import { or, eq } from "drizzle-orm";
import isEmpty from "just-is-empty";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  try {
    const { slugOrPostId } = params;

    const post = await getPost(slugOrPostId);

    if (!post)
      return NextResponse.json(
        { data: null, message: "Post not found" },
        { status: 404 }
      );

    return NextResponse.json({
      data: post,
      message: "Post retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: "Error retrieving post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  const { slugOrPostId } = params;
  const body = await req.json();
  const session = await getSession();
  const oldPost = await getPlainPostWithCache(slugOrPostId);
  return await checkPermission(
    {
      requiredPermission: "posts:edit",
      isOwner: oldPost?.author_id === session?.user?.id,
    },
    async () => {
      try {
        if (!oldPost)
          return NextResponse.json(
            {
              message: "Post not found",
            },
            { status: 404 }
          );

        await db
          .update(posts)
          .set({
            ...body,
            published_at:
              oldPost.status === "published" && isEmpty(oldPost.published_at)
                ? new Date()
                : body?.status === "published" && oldPost.published_at !== null
                  ? new Date(oldPost.published_at as Date)
                  : null,
            scheduled_at: body.scheduled_at
              ? new Date(body.scheduled_at)
              : null,
            toc:
              body?.generate_toc &&
                body?.status === "published" &&
                !isEmpty(body?.content)
                ? generateToc(body?.content || "", body?.toc_depth ?? 2)
                : oldPost?.toc,
            reading_time: body?.content
              ? calculateReadingTime(
                stripHtml(decodeAndSanitizeHtml(body?.content || ""))
              )
              : oldPost?.reading_time,
            updated_at: new Date(),
          })
          .where(
            or(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId))
          );
        const post = await getPostForEditing(slugOrPostId);
        revalidateTag("getPostWithCache");
        revalidateTag("getPlainPostWithCache");

        return NextResponse.json(
          {
            data: post,
            message: "Post updated successfully",
            lastUpdate: new Date().getTime(),
          },
          {
            status: 200,
          }
        );
      } catch (error) {
        logger.debug("Error", error as any);

        return NextResponse.json(
          { data: null, error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  const { slugOrPostId } = params;
  const oldPost = await getPlainPost(slugOrPostId);
  return await checkPermission(
    {
      requiredPermission: "posts:delete",
    },
    async () => {
      try {
        if (!oldPost)
          return NextResponse.json(
            {
              message: "Post not found",
            },
            { status: 404 }
          );
        await db
          .update(posts)
          .set({ status: "deleted" })
          .where(
            or(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId))
          );
        revalidateTag("getPost");
        revalidateTag("getPlainPost");
        return NextResponse.json(
          {
            message: "Post deleted successfully",
          },
          { status: 200 }
        );
      } catch (error) {
        logger.debug("Error", error as any);
        return NextResponse.json(
          { data: null, error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }
  );
}
function generateToc(content: string, depth: number) {
  const sanitizedContent = decodeAndSanitizeHtml(content);
  const toc = parseHtmlHeadings(sanitizedContent, {
    maxDepth: depth,
    maxLevel: 3,
  }).toc;
  return toc;
}

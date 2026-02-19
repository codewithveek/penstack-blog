import { db } from "@/db";
import { comments } from "@/db/schemas/posts.sql";
import { getSession } from "@/lib/auth/session";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    const post = await db.query.posts.findFirst({
      where: (posts, { or, eq }) =>
        or(
          eq(posts.slug, params.slugOrPostId),
          eq(posts.post_id, params.slugOrPostId)
        ),
      with: {
        comments: {
          limit,
          //   offset,
          orderBy: (comments, { desc }) => [desc(comments.created_at)],
          columns: {
            content: true,
            created_at: true,
            id: true,
            post_id: true,
          },
          with: {
            author: {
              columns: {
                name: true,
                avatar: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const totalComments = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(eq(comments.post_id, post?.id));

    const total = totalComments[0].count;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: post?.comments,
      meta: {
        page,
        totalPages,
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }
    const post = await db.query.posts.findFirst({
      where: (posts, { or, eq }) =>
        or(
          eq(posts.slug, params.slugOrPostId),
          eq(posts.post_id, params.slugOrPostId)
        ),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newComment] = await db
      .insert(comments)
      .values({ post_id: post?.id, content, author_id: session?.user?.id })
      .$returningId();

    return NextResponse.json(
      { data: newComment, message: "Comment added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

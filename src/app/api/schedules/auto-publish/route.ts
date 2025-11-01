import { db } from "@/db";
import { posts } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { post_id } = (await req.json()) as { post_id: string };
    if (!post_id) {
      return NextResponse.json(
        {
          message: "post_id is required",
        },
        { status: 400 }
      );
    }
    await db
      .update(posts)
      .set({
        status: "published",
      })
      .where(eq(posts.post_id, post_id));
    return NextResponse.json({
      message: "Post published successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error publishing posts...",
        error,
      },
      { status: 500 }
    );
  }
}

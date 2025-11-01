import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags, postTags } from "@/db/schemas/posts.sql";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for limit
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    const popularTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        post_count: sql<number>`count(${postTags.post_id})`.as("post_count"),
        created_at: tags.created_at,
        updated_at: tags.updated_at,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tag_id))
      .groupBy(tags.id)
      .orderBy(desc(sql`post_count`))
      .limit(limit);

    return NextResponse.json(
      {
        data: popularTags,
        message: "Popular tags fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return NextResponse.json(
      {
        data: null,
        error: "Failed to retrieve popular tags",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

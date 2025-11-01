import { db } from "@/db";
import { tags } from "@/db/schemas/posts.sql";
import { eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ tags: [] });
    }

    const searchResults = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(tags)
      .where(ilike(tags.name, `%${query}%`))
      .limit(20);

    return NextResponse.json({
      data: searchResults,
    });
  } catch (error) {
    console.error("Error searching tags:", error);
    return NextResponse.json(
      { error: "Failed to search tags" },
      { status: 500 }
    );
  }
}

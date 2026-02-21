import { NextRequest, NextResponse } from "next/server";

import { queryTagsWithFilters } from "@/src/lib/queries/tags";
import { tags } from "@/src/db/schemas";
import { db } from "@/src/db";
import { checkPermission } from "@/src/lib/auth/check-permission";
import { sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const tagsResult = await queryTagsWithFilters({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      sort: searchParams.get("sort") || "name",
      hasPostsOnly: searchParams.get("hasPostsOnly") === "true",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    });

    return NextResponse.json(
      {
        ...tagsResult,
        message: "Tags fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: null, error: "Failed to retrieve tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return await checkPermission(
    { requiredPermission: "posts:create" },
    async () => {
      try {
        const { name, slug, description } = await request.json();

        if (!name || !slug) {
          return NextResponse.json(
            { error: "Name and slug are required" },
            { status: 400 }
          );
        }

        const newCategory = await db
          .insert(tags)
          .values({ name, slug, description })
          .onDuplicateKeyUpdate({ set: { name: sql`name`, slug: sql`slug` } });
        revalidateTag("queryTagsWithFilters");

        return NextResponse.json(
          { data: newCategory, message: "Tag created successfully" },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          { data: null, error: "Failed to create category" },
          { status: 500 }
        );
      }
    }
  );
}

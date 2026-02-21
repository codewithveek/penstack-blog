import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { categories, posts } from "@/src/db/schemas/posts.sql";
import { and, eq, sql } from "drizzle-orm";
import { checkPermission } from "@/src/lib/auth/check-permission";
import { queryCategoriesWithFilters } from "@/src/lib/queries/categories";
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const categories = await queryCategoriesWithFilters({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      sortBy: searchParams.get("sortBy") || "name",
      hasPostsOnly: searchParams.get("hasPostsOnly") === "true",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    });

    return NextResponse.json(
      {
        ...categories,
        message: "Categories fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { data: null, error: "Failed to retrieve categories" },
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
          .insert(categories)
          .values({ name, slug, description })
          .onDuplicateKeyUpdate({ set: { name: sql`name`, slug: sql`slug` } });
        revalidateTag("queryCategoriesWithFilters");

        return NextResponse.json(
          { data: newCategory, message: "Category created successfully" },
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

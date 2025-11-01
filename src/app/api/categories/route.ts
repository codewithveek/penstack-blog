import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, posts } from "@/db/schemas/posts.sql";
import { and, eq, sql } from "drizzle-orm";
import { checkPermission } from "@/lib/auth/check-permission";
import { revalidateTag } from "next/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1); // Ensure minimum page is 1
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100); // Add upper bound
  const sort = ["name", "popular"].includes(searchParams.get("sort") || "")
    ? searchParams.get("sort")
    : "name";
  const hasPostsOnly = searchParams.get("hasPostsOnly") === "true" || true;
  const offset = (page - 1) * limit;

  try {
    let totalQuery;
    db.select({ count: sql<number>`count(distinct ${categories.id})` }).from(
      categories
    );

    if (hasPostsOnly) {
      totalQuery = db
        .select({ count: sql<number>`count(distinct ${categories.id})` })
        .from(categories)
        .leftJoin(posts, eq(posts.category_id, categories.id))
        .groupBy(categories.id)
        .having(sql`count(${posts.id}) > 0`);
    } else {
      totalQuery = db
        .select({ count: sql<number>`count(distinct ${categories.id})` })
        .from(categories);
    }

    const totalResult = await totalQuery;

    const total = Number(totalResult?.[0].count);

    let query = db.query.categories.findMany({
      limit,
      offset,
      with: {
        posts: {
          columns: {
            id: true,
          },
        },
      },
    });

    let allCategories;

    if (sort === "popular") {
      const categoriesWithCount = db.$with("categoriesWithCount").as(
        db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            postCount: sql<number>`count(${posts.id})`.as("post_count"),
          })
          .from(categories)
          .leftJoin(posts, eq(posts.category_id, categories.id))
          .groupBy(categories.id)
          .having(hasPostsOnly ? sql`count(${posts.id}) > 0` : undefined)
          .orderBy(sql`post_count DESC`)
          .limit(limit)
          .offset(offset)
      );

      allCategories = await db
        .with(categoriesWithCount)
        .select()
        .from(categoriesWithCount);
    } else {
      allCategories = await query;
    }

    return NextResponse.json(
      {
        data: allCategories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "All categories fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

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
        const { name, slug } = await request.json();

        if (!name || !slug) {
          return NextResponse.json(
            { error: "Name and slug are required" },
            { status: 400 }
          );
        }

        const newCategory = await db
          .insert(categories)
          .values({ name, slug })
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

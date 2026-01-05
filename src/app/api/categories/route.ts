import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, posts } from "@/db/schemas/posts.sql";
import { and, eq, sql } from "drizzle-orm";
import { checkPermission } from "@/lib/auth/check-permission";
import { revalidateTag, revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
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
    logger.error("Error fetching categories", error, { page, limit, sort });

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
        const body = await request.json();
        const validated = categorySchema.parse(body);
        const { name, slug } = validated;

        const newCategory = await db
          .insert(categories)
          .values({ name, slug })
          .onDuplicateKeyUpdate({ set: { name: sql`name`, slug: sql`slug` } });

        logger.info("Category created", { name, slug });

        revalidateTag("queryCategoriesWithFilters");
        revalidatePath("/categories");
        revalidatePath("/");

        return NextResponse.json(
          { data: newCategory, message: "Category created successfully" },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof ZodError) {
          logger.warn("Category creation validation failed", {
            errors: error.issues,
          });
          return NextResponse.json(
            {
              data: null,
              error: "Validation failed",
              errors: error.issues,
            },
            { status: 400 }
          );
        }

        logger.error("Error creating category", error);
        return NextResponse.json(
          { data: null, error: "Failed to create category" },
          { status: 500 }
        );
      }
    }
  );
}

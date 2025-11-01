import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schemas/posts.sql";
import { eq, sql } from "drizzle-orm";
import { checkPermission } from "@/lib/auth/check-permission";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = (page - 1) * limit;

  try {
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tags);
    const total = Number(totalResult[0].count);

    const allTags = await db.select().from(tags).limit(limit).offset(offset);

    return NextResponse.json(
      {
        data: allTags,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: "All tags fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
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
        const { name, slug } = await request.json();

        if (!name || !slug) {
          return NextResponse.json(
            { error: "Name and slug are required" },
            { status: 400 }
          );
        }

        const [response] = await db
          .insert(tags)
          .values({ name, slug })
          .onDuplicateKeyUpdate({ set: { name: sql`name`, slug: sql`slug` } })
          .$returningId();
        return NextResponse.json(
          { data: response, message: "Tag created successfully" },
          { status: 201 }
        );
      } catch (error) {
        return NextResponse.json(
          { data: null, error: "Failed to create Tag" },
          { status: 500 }
        );
      }
    }
  );
}

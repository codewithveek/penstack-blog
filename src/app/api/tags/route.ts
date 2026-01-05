import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schemas/posts.sql";
import { eq, sql } from "drizzle-orm";
import { checkPermission } from "@/lib/auth/check-permission";
import { tagSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Number(searchParams.get("limit")) || 20);
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
    logger.error("Error fetching tags", error, { page, limit });
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
        const body = await request.json();
        const validated = tagSchema.parse(body);
        const { name, slug } = validated;

        const [response] = await db
          .insert(tags)
          .values({ name, slug })
          .onDuplicateKeyUpdate({ set: { name: sql`name`, slug: sql`slug` } })
          .$returningId();

        logger.info("Tag created", { name, slug, id: response.id });

        revalidatePath("/tags");
        revalidatePath("/");

        return NextResponse.json(
          { data: response, message: "Tag created successfully" },
          { status: 201 }
        );
      } catch (error) {
        if (error instanceof ZodError) {
          logger.warn("Tag creation validation failed", {
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

        logger.error("Error creating tag", error);
        return NextResponse.json(
          { data: null, error: "Failed to create Tag" },
          { status: 500 }
        );
      }
    }
  );
}

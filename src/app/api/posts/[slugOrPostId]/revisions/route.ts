import { db } from "@/src/db";
import { posts, postRevisions } from "@/src/db/schemas";
import { checkPermission } from "@/src/lib/auth/check-permission";
import { desc, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  const { slugOrPostId } = params;
  return await checkPermission(
    { requiredPermission: "posts:edit" },
    async () => {
      try {
        const post = await db.query.posts.findFirst({
          where: or(
            eq(posts.slug, slugOrPostId),
            eq(posts.post_id, slugOrPostId)
          ),
          columns: { id: true },
        });

        if (!post) {
          return NextResponse.json(
            { data: null, message: "Post not found" },
            { status: 404 }
          );
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(
          50,
          Math.max(1, Number(searchParams.get("limit")) || 10)
        );
        const offset = (page - 1) * limit;

        const [totalResult, revisions] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(postRevisions)
            .where(eq(postRevisions.post_id, post.id)),
          db.query.postRevisions.findMany({
            where: eq(postRevisions.post_id, post.id),
            orderBy: [desc(postRevisions.revision_number)],
            columns: {
              id: true,
              post_id: true,
              title: true,
              summary: true,
              revision_number: true,
              revised_by: true,
              created_at: true,
            },
            limit,
            offset,
          }),
        ]);

        const total = Number(totalResult[0].count);

        return NextResponse.json({
          data: revisions,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          message: "Post revisions fetched successfully",
        });
      } catch (error) {
        return NextResponse.json(
          { data: null, error: "Failed to fetch revisions" },
          { status: 500 }
        );
      }
    }
  );
}

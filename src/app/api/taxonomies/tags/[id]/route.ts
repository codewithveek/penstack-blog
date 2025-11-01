import { db } from "@/db";
import { tags } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const queryTag = async function (id: number) {
  const category = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });
  return category;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const { id } = params;
  try {
    const tag = await queryTag(id);
    if (!tag) {
      return NextResponse.json(
        { data: null, message: "Tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: tag });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error?.message, message: "Something went wrong..." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const { id } = params;
  const body = await req.json();
  return await checkPermission(
    { requiredPermission: "posts:edit" },
    async () => {
      try {
        const tag = await queryTag(id);
        if (!tag) {
          return NextResponse.json(
            { data: null, message: "Tag not found" },
            { status: 404 }
          );
        }
        await db.update(tags).set(body).where(eq(tags.id, id));
        revalidateTag("queryTagsWithFilters");

        return NextResponse.json({
          data: {},
          message: "Tag updated successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error?.message, message: "Failed to update tag" },
          { status: 500 }
        );
      }
    }
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const { id } = params;
  return await checkPermission(
    { requiredPermission: "posts:delete" },
    async () => {
      try {
        const tag = await queryTag(id);
        if (!tag) {
          return NextResponse.json(
            { data: null, message: "Tag not found" },
            { status: 404 }
          );
        }

        await db.delete(tags).where(eq(tags.id, id));
        revalidateTag("queryTagsWithFilters");
        return NextResponse.json({
          message: "Tag deleted successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error?.message, message: "Failed to delete tag" },
          { status: 500 }
        );
      }
    }
  );
}

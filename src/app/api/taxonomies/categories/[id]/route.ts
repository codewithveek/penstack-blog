import { db } from "@/db";
import { categories } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const queryCategory = async function (id: number) {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
  });
  return category;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const { id } = params;
  try {
    const category = await queryCategory(id);
    if (!category) {
      return NextResponse.json(
        { data: null, message: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: category });
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
        const category = await queryCategory(id);
        if (!category) {
          return NextResponse.json(
            { data: null, message: "Category not found" },
            { status: 404 }
          );
        }
        await db
          .update(categories)
          .set({ name: body.name, slug: body.slug })
          .where(eq(categories.id, id));
        revalidateTag("queryCategoriesWithFilters");
        return NextResponse.json({
          data: {},
          message: "Category updated successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error?.message, message: "Failed to update category" },
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
        const category = await queryCategory(id);
        if (!category) {
          return NextResponse.json(
            { data: null, message: "Category not found" },
            { status: 404 }
          );
        }
        await db.delete(categories).where(eq(categories.id, id));
        revalidateTag("queryCategoriesWithFilters");
        return NextResponse.json({
          message: "Category deleted successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: error?.message, message: "Failed to delete category" },
          { status: 500 }
        );
      }
    }
  );
}

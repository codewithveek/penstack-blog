import { getPostsByCategory } from "@/lib/queries/category-posts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string | number } }
) {
  const { id } = params;

  try {
    const posts = await getPostsByCategory({ categoryNameOrSlugOrId: id });
    return NextResponse.json({
      data: posts,
      message: "Category Posts fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error?.message, message: "Something went wrong..." },
      { status: 500 }
    );
  }
}

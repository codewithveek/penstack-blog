import { NextResponse, NextRequest } from "next/server";
import { fetchMediaWithFilters } from "@/lib/queries/media";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const folder = searchParams.get("folder");
    const sortBy =
      (searchParams.get("sortBy") as "created_at" | "name" | "size") ||
      "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const result = await fetchMediaWithFilters({
      page,
      limit,
      search,
      type,
      folder,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

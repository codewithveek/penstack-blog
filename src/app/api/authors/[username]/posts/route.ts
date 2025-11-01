import { db } from "@/db";
import { posts, users } from "@/db/schemas";
import { getAuthorByUsername, getAuthorPosts } from "@/lib/queries/author";
import { PostSelect } from "@/types";
import { getServerSearchParams } from "@/utils";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const searchParams = getServerSearchParams<{
    status: "draft" | "deleted" | "published" | "all";
    limit: number;
    page: number;
  }>(req);
  const { username } = params;
  try {
    const { status = "published", limit = 10, page = 1 } = searchParams;
    if (!username)
      return NextResponse.json(
        {
          data: null,
          message: "No 'username' provided",
        },
        { status: 400 }
      );

    const user = await getAuthorByUsername(username);
    if (!user)
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );

    const _posts = await getAuthorPosts(user, limit, page, status);

    return NextResponse.json({
      data: _posts,
      message: "All posts fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error?.message,
      data: null,
      message: "Something went wrong... could not fetch posts",
    });
  }
}

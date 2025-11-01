import { db } from "@/db";
import { users } from "@/db/schemas";
import { getAuthorByUsername } from "@/lib/queries/author";
import { eq } from "drizzle-orm";

import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  try {
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
    return NextResponse.json({
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error: any) {
    return NextResponse.json({
      data: null,
      error: error?.message,
      message: "Something went wrong... could not fetch user",
    });
  }
}

import { db } from "@/db";
import { users } from "@/db/schemas";
import { getSession } from "@/lib/auth/next-auth";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { authId: string } }
) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.auth_id, params.authId),
      columns: {
        password: false,
        email: false,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: user,
      message: "User fetched successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        data: null,
        error: error?.message,
        message: "Something went wrong... could not fetch user",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { authId: string } }
) {
  const session = await getSession();
  const currentUser = session?.user;
  try {
    const body = await req.json();
    const user = await db.query.users.findFirst({
      where: eq(users.auth_id, params.authId),
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check if user is owner or has permission
    if (user.auth_id !== currentUser?.id && currentUser?.role_id !== 1) {
      return NextResponse.json(
        {
          data: null,
          message: "Unauthorized to update this profile",
        },
        { status: 403 }
      );
    }
    let hashedPassword: string = "";
    if (body.password) {
      hashedPassword = await hash(body.password, 10);
    }

    await db
      .update(users)
      .set({
        name: body.name,
        email: body.email,
        username: body.username,
        bio: body.bio,
        title: body.title,
        avatar: body.avatar,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      })
      .where(eq(users.auth_id, params.authId));

    return NextResponse.json({
      data: {},
      message: "User updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        data: null,
        error: error?.message,
        message: "Something went wrong... could not update user",
      },
      { status: 500 }
    );
  }
}

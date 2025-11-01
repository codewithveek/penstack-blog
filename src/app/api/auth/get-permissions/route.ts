import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/next-auth";
import { getUserPermissions } from "@/lib/auth/permissions";
import { TPermissions } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const email = searchParams.get("email") as string;

    let userPermissions: TPermissions[] = [];

    if (email) {
      userPermissions = await getUserPermissions(email);

      return NextResponse.json({
        data: {
          permissions: userPermissions,
        },
      });
    }
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          data: {
            permissions: [],
          },
        },
        { status: 401 }
      );
    }

    userPermissions = await getUserPermissions(session.user.email);

    return NextResponse.json({
      data: {
        permissions: userPermissions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

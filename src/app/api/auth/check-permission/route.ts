import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/next-auth";
import { getUserPermissions } from "@/lib/auth/permissions";
import { getPublicPermissions } from "@/lib/auth/public-permissions"; // Separate file
import { TPermissions } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const permission = searchParams.get("permission") as TPermissions;
    const email = searchParams.get("email") as string;
    if (!permission) {
      return NextResponse.json(
        { error: "Permission not provided" },
        { status: 400 }
      );
    }
    const publicPermissions = await getPublicPermissions();
    if (publicPermissions.includes(permission)) {
      return NextResponse.json({
        data: {
          hasPermission: true,
          permissions: publicPermissions,
        },
      });
    }
    let userPermissions: TPermissions[] = [];

    if (email) {
      userPermissions = await getUserPermissions(email);
      const hasPermission = userPermissions.includes(permission);

      return NextResponse.json({
        data: {
          hasPermission: userPermissions.includes(permission),
          permissions: userPermissions,
        },
      });
    }

    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          data: {
            hasPermission: false,
            permissions: [],
          },
        },
        { status: 401 }
      );
    }

    userPermissions = await getUserPermissions(session.user.email);

    return NextResponse.json({
      data: {
        hasPermission: userPermissions.includes(permission),
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

export async function POST(req: NextRequest) {
  try {
    const { permission, email } = await req.json();
    if (!permission) {
      return NextResponse.json(
        { error: "Permission not provided" },
        { status: 400 }
      );
    }
    // Check public permissions first
    const publicPermissions = await getPublicPermissions();
    if (publicPermissions.includes(permission)) {
      return NextResponse.json({
        data: {
          hasPermission: true,
          permissions: publicPermissions,
        },
      });
    }

    let userPermissions: TPermissions[] = [];
    if (email) {
      userPermissions = await getUserPermissions(email);

      return NextResponse.json({
        data: {
          hasPermission: userPermissions.includes(permission),
          permissions: userPermissions,
        },
      });
    }

    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          data: {
            hasPermission: false,
            permissions: [],
          },
        },
        { status: 401 }
      );
    }

    userPermissions = await getUserPermissions(session.user.email);

    return NextResponse.json({
      data: {
        hasPermission: userPermissions.includes(permission),
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

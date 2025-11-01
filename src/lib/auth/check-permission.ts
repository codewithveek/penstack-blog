import { NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/auth/permissions";
import { getSession } from "@/lib/auth/next-auth";
import { TPermissions } from "../../types";

import { Session } from "next-auth";
import { getPublicPermissions } from "./public-permissions";

export async function checkPermission<T = NextResponse>(
  {
    isOwner,
    requiredPermission,
  }: { requiredPermission: TPermissions; isOwner?: boolean },
  handler: (user?: Session["user"]) => Promise<T>,
  isServerComp: boolean = false
) {
  // First check if this is a public permission
  const publicPermissions = await getPublicPermissions();
  if (publicPermissions.includes(requiredPermission)) {
    return handler();
  }

  const session = await getSession();

  if (!session?.user?.email) {
    if (isServerComp) throw new Error("Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userPermissions = await getUserPermissions(session.user.email);
  if (isOwner) return handler();
  if (!userPermissions.includes(requiredPermission)) {
    if (isServerComp) throw new Error("Forbidden");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return handler(session?.user);
}

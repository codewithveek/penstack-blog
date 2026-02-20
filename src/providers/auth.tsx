"use client";

import { useSession } from "@/lib/auth/auth-client";
import { usePermissionsStore } from "../state/permissions";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const setPermissions = usePermissionsStore((state) => state.setPermissions);
  const setisLoading = usePermissionsStore((state) => state.setIsLoading);

  useEffect(() => {
    setisLoading(true);
    setPermissions((session?.user as any)?.permissions || []);
    setisLoading(false);
  }, [(session?.user as any)?.permissions, setPermissions, setisLoading]);

  return <>{children}</>;
}

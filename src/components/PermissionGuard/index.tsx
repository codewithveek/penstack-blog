"use client";

import { Spinner } from "@chakra-ui/react";
import { usePermissions } from "@/hooks/usePermissions";
import { TPermissions } from "@/types";

import { redirect } from "next/navigation";
import { memo } from "react";

export const PermissionGuard = memo(function PermissionGuard({
  requiredPermission,
  children,
  shouldRedirect,
  isOwner,
  showLoader = true,
}: {
  requiredPermission: TPermissions;
  children: React.ReactNode;
  shouldRedirect?: boolean;
  isOwner?: boolean;
  showLoader?: boolean;
}) {
  const { hasPermission, loading } = usePermissions(requiredPermission);

  if (loading && showLoader) {
    return (
      <div>
        <Spinner size={"sm"} />
      </div>
    );
  }

  if (isOwner) {
    return children;
  }

  if (!hasPermission && shouldRedirect) {
    redirect("/");
  }

  if (!hasPermission) {
    return null;
  }

  return children;
});

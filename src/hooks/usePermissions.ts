import { TPermissions } from "../types";
import { usePermissionsStore } from "../state/permissions";

export const usePermissions = (requiredPermission: TPermissions) => {
  const permissions = usePermissionsStore((state) => state.permissions);
  const isLoading = usePermissionsStore((state) => state.isLoading);
  const hasPermission = permissions.includes(requiredPermission);
  return { hasPermission, loading: isLoading };
};

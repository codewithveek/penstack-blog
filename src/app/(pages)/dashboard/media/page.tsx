import DashboardMediaPage from "@/components//pages/Dashboard/Medias";
import { PermissionGuard } from "@/components//PermissionGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Medias",
};
export default function Page() {
  return (
    <PermissionGuard requiredPermission={"media:read"} shouldRedirect>
      <DashboardMediaPage />
    </PermissionGuard>
  );
}

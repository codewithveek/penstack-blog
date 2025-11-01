import UsersDashboard from "@/components//pages/Dashboard/Users";
import { PermissionGuard } from "@/components//PermissionGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Users",
};
export default function Page() {
  return (
    <PermissionGuard requiredPermission={"users:read"} shouldRedirect>
      <UsersDashboard />
    </PermissionGuard>
  );
}

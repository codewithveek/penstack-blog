import Overview from "@/components//pages/Dashboard/Overview";
import { PermissionGuard } from "@/components//PermissionGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Overview",
};
export default function Page() {
  return (
    <PermissionGuard requiredPermission={"analytics:view"} shouldRedirect>
      <Overview />
    </PermissionGuard>
  );
}

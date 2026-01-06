import IntegrationsPage from "@/components/pages/Dashboard/Integrations";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function Page() {
    return <PermissionGuard requiredPermission={"settings:read"} shouldRedirect>
        <IntegrationsPage />
    </PermissionGuard>
}
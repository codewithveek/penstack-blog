import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { oauthProviders, oauthProviderAuditLog } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { logger } from "@/lib/logger";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    return await checkPermission(
        { requiredPermission: "settings:write" },
        async () => {
            try {
                const session = await getSession();
                const providerId = parseInt(params.id);

                const [provider] = await db
                    .select()
                    .from(oauthProviders)
                    .where(eq(oauthProviders.id, providerId))
                    .limit(1);

                if (!provider) {
                    return NextResponse.json(
                        { error: "Provider not found" },
                        { status: 404 }
                    );
                }

                const newStatus = !provider.is_enabled;

                await db
                    .update(oauthProviders)
                    .set({
                        is_enabled: newStatus,
                        updated_by: session?.user?.email || "system",
                    })
                    .where(eq(oauthProviders.id, providerId));

                await db.insert(oauthProviderAuditLog).values({
                    provider_id: providerId,
                    action: newStatus ? "enabled" : "disabled",
                    changed_by: session?.user?.email || "system",
                    changes: JSON.stringify({ is_enabled: newStatus }),
                });

                logger.info(`OAuth provider ${newStatus ? "enabled" : "disabled"}`, {
                    providerId,
                    providerName: provider.provider_name,
                });

                return NextResponse.json({
                    data: { is_enabled: newStatus },
                    message: `Provider ${newStatus ? "enabled" : "disabled"} successfully`,
                });
            } catch (error) {
                logger.error("Error toggling OAuth provider", error);
                return NextResponse.json(
                    { error: "Failed to toggle provider" },
                    { status: 500 }
                );
            }
        }
    );
}

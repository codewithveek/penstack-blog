import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { oauthProviders, oauthProviderAuditLog } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { oauthProviderSchema } from "@/lib/validation/oauth-schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { encryptKey, decryptKey } from "@/lib/encryption";
import { getSession } from "@/lib/auth/session";

export const revalidate = 0;

export async function GET(req: NextRequest) {
    return await checkPermission(
        { requiredPermission: "settings:read" },
        async () => {
            try {
                const providers = await db.select({
                    id: oauthProviders.id,
                    provider_name: oauthProviders.provider_name,
                    display_name: oauthProviders.display_name,
                    client_id: oauthProviders.client_id,
                    is_enabled: oauthProviders.is_enabled,
                    redirect_uri: oauthProviders.redirect_uri,
                    scopes: oauthProviders.scopes,
                    created_at: oauthProviders.created_at,
                    updated_at: oauthProviders.updated_at,
                }).from(oauthProviders);

                return NextResponse.json({
                    data: providers,
                    message: "OAuth providers fetched successfully",
                });
            } catch (error) {
                logger.error("Error fetching OAuth providers", error);
                return NextResponse.json(
                    {
                        data: null,
                        error: "Failed to fetch OAuth providers",
                    },
                    { status: 500 }
                );
            }
        }
    );
}

export async function POST(req: NextRequest) {
    return await checkPermission(
        { requiredPermission: "settings:write" },
        async () => {
            try {
                const session = await getSession();
                const body = await req.json();
                const validated = oauthProviderSchema.parse(body);

                const encryptedSecret = encryptKey(validated.client_secret);

                const [provider] = await db
                    .insert(oauthProviders)
                    .values({
                        provider_name: validated.provider_name,
                        display_name: validated.display_name,
                        client_id: validated.client_id,
                        client_secret: encryptedSecret,
                        redirect_uri: validated.redirect_uri,
                        scopes: validated.scopes ? JSON.stringify(validated.scopes) : null,
                        additional_config: validated.additional_config
                            ? JSON.stringify(validated.additional_config)
                            : null,
                        created_by: session?.user?.email || "system",
                    })
                    .$returningId();

                await db.insert(oauthProviderAuditLog).values({
                    provider_id: provider.id,
                    action: "created",
                    changed_by: session?.user?.email || "system",
                    changes: JSON.stringify({ provider_name: validated.provider_name }),
                });

                logger.info("OAuth provider created", {
                    providerId: provider.id,
                    providerName: validated.provider_name,
                });

                return NextResponse.json(
                    {
                        data: { id: provider.id },
                        message: "OAuth provider created successfully",
                    },
                    { status: 201 }
                );
            } catch (error) {
                if (error instanceof ZodError) {
                    logger.warn("OAuth provider validation failed", {
                        errors: error.issues,
                    });
                    return NextResponse.json(
                        {
                            data: null,
                            message: "Validation failed",
                            errors: error.issues,
                        },
                        { status: 400 }
                    );
                }

                logger.error("Error creating OAuth provider", error);
                return NextResponse.json(
                    {
                        data: null,
                        error: "Failed to create OAuth provider",
                    },
                    { status: 500 }
                );
            }
        }
    );
}

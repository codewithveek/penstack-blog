import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, siteSettings, emailServiceConfig } from "@/db/schemas";
import { setupCompleteSchema } from "@/lib/validation/setup-schemas";
import { logger } from "@/lib/logger";
import { ZodError } from "zod";
import { hash } from "bcryptjs";
import { markSetupComplete } from "@/lib/setup/check-setup-status";
import { encryptKey } from "@/lib/encryption";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validated = setupCompleteSchema.parse(body);

        await db.transaction(async (tx) => {
            const hashedPassword = await hash(validated.admin.password, 10);

            const [adminUser] = await tx
                .insert(users)
                .values({
                    name: validated.admin.name,
                    email: validated.admin.email,
                    username: validated.admin.email.split("@")[0],
                    password: hashedPassword,
                    role_id: 1,
                    auth_type: "local",
                })
                .$returningId();

            logger.info("Admin user created during setup", {
                userId: adminUser.id,
                email: validated.admin.email,
            });

            const settingsToUpdate = [
                { key: "siteName", value: validated.siteInfo.siteName },
                { key: "siteDescription", value: validated.siteInfo.siteDescription || "" },
                { key: "siteTagline", value: validated.siteInfo.siteTagline || "" },
            ];

            if (validated.siteInfo.siteLogo) {
                settingsToUpdate.push({
                    key: "siteLogo",
                    value: validated.siteInfo.siteLogo,
                });
            }

            if (validated.siteInfo.timezone) {
                settingsToUpdate.push({
                    key: "timezone",
                    value: validated.siteInfo.timezone,
                });
            }

            if (validated.organization) {
                if (validated.organization.organizationName) {
                    settingsToUpdate.push({
                        key: "organizationName",
                        value: validated.organization.organizationName,
                    });
                }
                if (validated.organization.organizationUrl) {
                    settingsToUpdate.push({
                        key: "organizationUrl",
                        value: validated.organization.organizationUrl,
                    });
                }
                if (validated.organization.organizationEmail) {
                    settingsToUpdate.push({
                        key: "organizationEmail",
                        value: validated.organization.organizationEmail,
                    });
                }
                if (validated.organization.organizationPhone) {
                    settingsToUpdate.push({
                        key: "organizationPhone",
                        value: validated.organization.organizationPhone,
                    });
                }
                if (validated.organization.organizationAddress) {
                    settingsToUpdate.push({
                        key: "organizationAddress",
                        value: validated.organization.organizationAddress,
                    });
                }
                if (validated.organization.organizationFounder) {
                    settingsToUpdate.push({
                        key: "organizationFounder",
                        value: validated.organization.organizationFounder,
                    });
                }
                if (validated.organization.organizationFoundingDate) {
                    settingsToUpdate.push({
                        key: "organizationFoundingDate",
                        value: validated.organization.organizationFoundingDate,
                    });
                }
            }

            for (const setting of settingsToUpdate) {
                await tx
                    .update(siteSettings)
                    .set({ value: setting.value })
                    .where(eq(siteSettings.key, setting.key));
            }

            if (validated.email && validated.email.serviceType !== "none") {
                const emailConfig: any = {
                    service_type: validated.email.serviceType,
                    is_active: true,
                    from_email: validated.email.fromEmail,
                    from_name: validated.email.fromName,
                };

                if (validated.email.serviceType === "smtp") {
                    emailConfig.smtp_host = validated.email.smtpHost;
                    emailConfig.smtp_port = validated.email.smtpPort;
                    emailConfig.smtp_user = validated.email.smtpUser;
                    emailConfig.smtp_password = encryptKey(validated.email.smtpPassword!);
                    emailConfig.smtp_secure = validated.email.smtpSecure;
                } else {
                    emailConfig.api_key = encryptKey(validated.email.apiKey!);
                }

                await tx.insert(emailServiceConfig).values(emailConfig);
            }

            await markSetupComplete();
        });

        logger.info("Setup completed successfully");

        return NextResponse.json({
            data: { success: true },
            message: "Setup completed successfully",
        });
    } catch (error) {
        if (error instanceof ZodError) {
            logger.warn("Setup validation failed", { errors: error.issues });
            return NextResponse.json(
                {
                    data: null,
                    message: "Validation failed",
                    errors: error.issues,
                },
                { status: 400 }
            );
        }

        logger.error("Error completing setup", error);
        return NextResponse.json(
            {
                data: null,
                error: "Failed to complete setup",
            },
            { status: 500 }
        );
    }
}

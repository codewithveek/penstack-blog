import { z } from "zod";

export const setupAdminSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(120),
    email: z.email("Invalid email address").max(255),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(255)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
});

export const setupSiteInfoSchema = z.object({
    siteName: z.string().min(1, "Site name is required").max(255),
    siteDescription: z.string().max(500).optional(),
    siteTagline: z.string().max(255).optional(),
    siteLogo: z.url().optional(),
    timezone: z.string().optional(),
});

export const setupOrganizationSchema = z.object({
    organizationName: z.string().max(255).optional(),
    organizationUrl: z.url().optional(),
    organizationEmail: z.email().optional(),
    organizationPhone: z.string().max(50).optional(),
    organizationAddress: z.string().optional(),
    organizationFounder: z.string().max(255).optional(),
    organizationFoundingDate: z.string().optional(),
}).optional();

export const setupEmailSchema = z.object({
    serviceType: z.enum(["smtp", "resend", "sendgrid", "mailgun", "none"]),
    apiKey: z.string().optional(),
    smtpHost: z.string().optional(),
    smtpPort: z.number().int().positive().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    smtpSecure: z.boolean().default(true),
    fromEmail: z.email("Invalid from email"),
    fromName: z.string().min(1, "From name is required"),
}).refine(
    (data) => {
        if (data.serviceType === "smtp") {
            return !!(data.smtpHost && data.smtpPort && data.smtpUser && data.smtpPassword);
        }
        if (data.serviceType === "resend" || data.serviceType === "sendgrid" || data.serviceType === "mailgun") {
            return !!data.apiKey;
        }
        return true;
    },
    {
        message: "Required fields missing for selected email service",
    }
);

export const setupCompleteSchema = z.object({
    admin: setupAdminSchema,
    siteInfo: setupSiteInfoSchema,
    organization: setupOrganizationSchema,
    email: setupEmailSchema.optional(),
});

export type SetupAdminInput = z.infer<typeof setupAdminSchema>;
export type SetupSiteInfoInput = z.infer<typeof setupSiteInfoSchema>;
export type SetupOrganizationInput = z.infer<typeof setupOrganizationSchema>;
export type SetupEmailInput = z.infer<typeof setupEmailSchema>;
export type SetupCompleteInput = z.infer<typeof setupCompleteSchema>;

import { z } from "zod";

export const oauthProviderSchema = z.object({
    provider_name: z.enum(["google", "github", "facebook", "twitter", "linkedin"]),
    display_name: z.string().min(1, "Display name is required").max(100),
    client_id: z.string().min(1, "Client ID is required").max(500),
    client_secret: z.string().min(1, "Client secret is required"),
    redirect_uri: z.url().optional(),
    scopes: z.array(z.string()).optional(),
    additional_config: z.record(z.any(), z.any()).optional(),
});

export const oauthProviderUpdateSchema = oauthProviderSchema.partial().extend({
    id: z.number().int().positive(),
});

export type OAuthProviderInput = z.infer<typeof oauthProviderSchema>;
export type OAuthProviderUpdateInput = z.infer<typeof oauthProviderUpdateSchema>;

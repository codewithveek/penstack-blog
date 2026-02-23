/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Environment variable type declarations
// Extend ProcessEnv so TypeScript knows about custom env vars.

declare namespace NodeJS {
  interface ProcessEnv {
    // API
    readonly NEXT_PUBLIC_API_URL: string | undefined;
    readonly API_INTERNAL_URL: string | undefined;
    readonly INTERNAL_API_SECRET: string | undefined;

    // Auth
    readonly NEXTAUTH_SECRET: string | undefined;
    readonly NEXTAUTH_URL: string | undefined;

    // Database (used by packages/core, not directly in apps/web)
    readonly DATABASE_URL: string | undefined;

    // Storage
    readonly NEXT_PUBLIC_STORAGE_PROVIDER: "r2" | "s3" | "cloudinary" | undefined;
    readonly NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string | undefined;

    // Misc
    readonly NODE_ENV: "development" | "production" | "test";
  }
}

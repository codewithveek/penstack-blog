/**
 * apps/api/src/providers/storage/index.ts
 *
 * Resolves and configures the FluxMedia MediaUploader for the chosen storage
 * backend (R2, S3, or Cloudinary). Called ONCE in container.ts.
 *
 * Per AGENTS.md §14: Storage interface IS MediaUploader (FluxMedia).
 * No raw cloud SDK is imported anywhere else in the codebase.
 */

import { MediaUploader } from "@fluxmedia/core";
import { R2Provider } from "@fluxmedia/r2";
import { S3Provider } from "@fluxmedia/s3";
import { CloudinaryProvider } from "@fluxmedia/cloudinary";
import { ConfigurationError } from "@cms/core/errors";

// Accepted MIME types enforced at the service layer (MediaService) via
// magic-byte validation. The storage provider operates on already-validated
// files. If @fluxmedia/plugins becomes available in the future, plugin-layer
// validation can be re-enabled here as defense-in-depth.

export async function resolveStorageProvider(): Promise<MediaUploader> {
  const provider = process.env.STORAGE_PROVIDER ?? "r2";

  let uploader: MediaUploader;

  if (provider === "r2") {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucket = process.env.R2_BUCKET;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
      throw new ConfigurationError(
        "CLOUDFLARE_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY are required when STORAGE_PROVIDER=r2"
      );
    }

    uploader = new MediaUploader(
      new R2Provider({
        accountId,
        bucket,
        accessKeyId,
        secretAccessKey,
        ...(process.env.R2_PUBLIC_URL
          ? { publicUrl: process.env.R2_PUBLIC_URL }
          : {}),
      })
    );
  } else if (provider === "s3") {
    const region = process.env.AWS_REGION;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      throw new ConfigurationError(
        "AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY are required when STORAGE_PROVIDER=s3"
      );
    }

    uploader = new MediaUploader(
      new S3Provider({
        region,
        bucket,
        accessKeyId,
        secretAccessKey,
        ...(process.env.S3_ENDPOINT
          ? {
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
            }
          : {}),
      })
    );
  } else if (provider === "cloudinary") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ConfigurationError(
        "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are required when STORAGE_PROVIDER=cloudinary"
      );
    }

    uploader = new MediaUploader(
      new CloudinaryProvider({
        cloudName,
        apiKey,
        apiSecret,
        secure: true,
      })
    );
  } else {
    throw new ConfigurationError(
      `Unknown STORAGE_PROVIDER "${provider}". Valid values: r2, s3, cloudinary`
    );
  }

  // ── Plugins ───────────────────────────────────────────────────────────────
  // NOTE: @fluxmedia/plugins is currently unavailable at runtime (empty package).
  // File validation (MIME type + size) is enforced in MediaService before upload.
  // When the plugins package ships with working code, uncomment the block below.

  return uploader;
}

/**
 * apps/api/src/providers/storage/index.ts
 *
 * Resolves the configured storage provider.
 * Called ONCE in container.ts.
 */

import type { IStorageProvider } from "@cms/core/types/providers";
import { ConfigurationError } from "@cms/core/errors";
import { R2StorageAdapter } from "./r2.adapter";
import { S3StorageAdapter } from "./s3.adapter";
import { CloudinaryStorageAdapter } from "./cloudinary.adapter";

export function resolveStorageProvider(): IStorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? "r2";

  if (provider === "r2") {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !publicUrl
    ) {
      throw new ConfigurationError(
        "R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL are required when STORAGE_PROVIDER=r2"
      );
    }

    return new R2StorageAdapter({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    });
  }

  if (provider === "s3") {
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new ConfigurationError(
        "S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME are required when STORAGE_PROVIDER=s3"
      );
    }

    return new S3StorageAdapter({
      region,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl: process.env.S3_PUBLIC_URL,
    });
  }

  if (provider === "cloudinary") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ConfigurationError(
        "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are required when STORAGE_PROVIDER=cloudinary"
      );
    }

    return new CloudinaryStorageAdapter({
      cloudName,
      apiKey,
      apiSecret,
      folder: process.env.CLOUDINARY_FOLDER,
    });
  }

  throw new ConfigurationError(
    `Unknown STORAGE_PROVIDER: ${provider}. Supported: r2, s3, cloudinary`
  );
}

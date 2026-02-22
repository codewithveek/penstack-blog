/**
 * apps/api/src/providers/storage/cloudinary.adapter.ts
 *
 * Cloudinary storage adapter with native image transformations.
 * The ONLY file that imports the Cloudinary SDK.
 */

import { v2 as cloudinary } from "cloudinary";
import type {
  IStorageProvider,
  StorageUploadParams,
  StorageUploadResult,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
}

export class CloudinaryStorageAdapter implements IStorageProvider {
  private readonly folder: string;

  constructor(config: CloudinaryConfig) {
    this.folder = config.folder ?? "cms";
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    try {
      // params.body may be Buffer or Readable
      const uploadable =
        params.body instanceof Buffer
          ? `data:${params.contentType};base64,${params.body.toString("base64")}`
          : params.body;

      const result = await cloudinary.uploader.upload(uploadable as string, {
        public_id: `${this.folder}/${params.key}`,
        resource_type: "auto",
        overwrite: true,
      });

      return {
        key: params.key,
        url: result.secure_url,
        size: result.bytes,
        contentType: params.contentType,
        metadata: { cloudinaryPublicId: result.public_id },
      };
    } catch (err) {
      throw new ProviderError(
        "cloudinary",
        `Failed to upload file: ${String(err)}`
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(`${this.folder}/${key}`);
    } catch (err) {
      throw new ProviderError(
        "cloudinary",
        `Failed to delete file: ${String(err)}`
      );
    }
  }

  getUrl(key: string): string {
    return cloudinary.url(`${this.folder}/${key}`, { secure: true });
  }

  async getSignedUploadUrl(
    _key: string,
    _contentType: string,
    _expiresInSeconds = 300
  ): Promise<string> {
    // Cloudinary uses signed parameters, not pre-signed URLs in the same model
    // Return an unsigned upload URL signed via cloudinary.utils
    throw new ProviderError(
      "cloudinary",
      "Use the Cloudinary signed upload widget via the frontend SDK for direct uploads"
    );
  }
}

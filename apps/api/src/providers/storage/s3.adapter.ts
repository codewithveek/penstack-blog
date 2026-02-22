/**
 * apps/api/src/providers/storage/s3.adapter.ts
 *
 * AWS S3 storage adapter.
 * The ONLY file that uses @aws-sdk/client-s3 for S3.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  IStorageProvider,
  StorageUploadParams,
  StorageUploadResult,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export class S3StorageAdapter implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(config: S3Config) {
    this.bucketName = config.bucketName;
    this.publicUrl = (
      config.publicUrl ??
      `https://${config.bucketName}.s3.${config.region}.amazonaws.com`
    ).replace(/\/$/, "");

    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
          ContentLength: params.size,
          Metadata: params.metadata,
        })
      );

      return {
        key: params.key,
        url: `${this.publicUrl}/${params.key}`,
        size: params.size ?? 0,
        contentType: params.contentType,
      };
    } catch (err) {
      throw new ProviderError("s3", `Failed to upload file: ${String(err)}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    } catch (err) {
      throw new ProviderError("s3", `Failed to delete file: ${String(err)}`);
    }
  }

  getUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds = 300
  ): Promise<string> {
    try {
      return getSignedUrl(
        this.client,
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ContentType: contentType,
        }),
        { expiresIn: expiresInSeconds }
      );
    } catch (err) {
      throw new ProviderError("s3", `Failed to get signed URL: ${String(err)}`);
    }
  }
}

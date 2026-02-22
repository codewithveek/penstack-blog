/**
 * apps/api/src/services/media.service.ts
 */

import crypto from "node:crypto";
import path from "node:path";
import { getFileType, type MediaUploader } from "@fluxmedia/core";
import type { IMediaRepository } from "@cms/core/types/repositories";
import type { MediaAsset } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";
import { NotFoundError, ValidationError } from "@cms/core/errors";

// Accepted MIME types — business-logic classification for the DB `type` column.
// The FluxMedia file-validation plugin enforces the same list at the upload layer.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
]);
const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function classifyMime(mimeType: string): MediaAsset["type"] | null {
  if (ALLOWED_IMAGE_TYPES.has(mimeType)) return "image";
  if (ALLOWED_VIDEO_TYPES.has(mimeType)) return "video";
  if (ALLOWED_AUDIO_TYPES.has(mimeType)) return "audio";
  if (ALLOWED_DOC_TYPES.has(mimeType)) return "document";
  return null;
}

export class MediaService {
  constructor(
    private readonly mediaRepo: IMediaRepository,
    private readonly storageProvider: MediaUploader
  ) {}

  async upload(
    siteId: string,
    uploadedById: string,
    fileBuffer: Buffer,
    originalFilename: string,
    declaredMimeType: string
  ): Promise<MediaAsset> {
    // Server-side MIME detection via magic bytes (FluxMedia utility).
    // Never trust the client-declared Content-Type — magic bytes take precedence.
    const detected = await getFileType(fileBuffer);
    const detectedMime = detected?.mime ?? declaredMimeType;
    const category = classifyMime(detectedMime);

    if (!category) {
      throw new ValidationError({
        file: [`File type ${detectedMime} is not allowed`],
      });
    }

    const ext = path.extname(originalFilename).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;

    // FluxMedia upload — file-validation and metadata-extraction plugins run
    // automatically via the hooks registered in resolveStorageProvider().
    const result = await this.storageProvider.upload(fileBuffer, {
      folder: siteId,
      filename,
      metadata: { site_id: siteId, uploaded_by: uploadedById },
    });

    return this.mediaRepo.create({
      id: crypto.randomUUID(),
      site_id: siteId,
      type: category,
      url: result.url,
      // result.id is the provider's canonical file identifier (S3/R2 object key
      // or Cloudinary public_id) — used for deletion and URL generation.
      storage_key: result.id,
      filename: originalFilename,
      mime_type: detectedMime,
      byte_size: result.size,
      width: result.width ?? null,
      height: result.height ?? null,
      alt_text: null,
      uploaded_by_id: uploadedById,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getById(siteId: string, id: string): Promise<MediaAsset> {
    const asset = await this.mediaRepo.findById(siteId, id);
    if (!asset) throw new NotFoundError("MediaAsset", id);
    return asset;
  }

  async listMedia(
    siteId: string,
    pagination: PaginationParams & { type?: MediaAsset["type"] }
  ): Promise<PaginatedResult<MediaAsset>> {
    return this.mediaRepo.findMany(siteId, pagination);
  }

  async deleteMedia(siteId: string, id: string): Promise<void> {
    const asset = await this.mediaRepo.findById(siteId, id);
    if (!asset) throw new NotFoundError("MediaAsset", id);

    // Remove from provider storage first (uses the provider's canonical ID)
    await this.storageProvider.delete(asset.storage_key);
    await this.mediaRepo.delete(siteId, id);
  }

  async getStorageUsage(
    siteId: string
  ): Promise<{ bytes: number; mb: number }> {
    const bytes = await this.mediaRepo.getTotalStorageBytes(siteId);
    return { bytes, mb: Math.round((bytes / 1024 / 1024) * 100) / 100 };
  }
}

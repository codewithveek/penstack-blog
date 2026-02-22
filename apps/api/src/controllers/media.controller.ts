/**
 * apps/api/src/controllers/media.controller.ts
 */

import type { MediaService } from "../services/media.service";
import type { MediaAsset } from "@cms/core/db/schema";
import type {
  PaginatedResult,
  PaginationParams,
} from "@cms/core/types/repositories";

export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  async upload(
    siteId: string,
    uploadedById: string,
    fileBuffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<MediaAsset> {
    return this.mediaService.upload(
      siteId,
      uploadedById,
      fileBuffer,
      filename,
      mimeType
    );
  }

  async getById(siteId: string, id: string): Promise<MediaAsset> {
    return this.mediaService.getById(siteId, id);
  }

  async list(
    siteId: string,
    pagination: PaginationParams & { type?: MediaAsset["type"] }
  ): Promise<PaginatedResult<MediaAsset>> {
    return this.mediaService.listMedia(siteId, pagination);
  }

  async delete(siteId: string, id: string): Promise<void> {
    return this.mediaService.deleteMedia(siteId, id);
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<{ alt_text: string; caption: string }>
  ): Promise<MediaAsset> {
    return this.mediaService.updateMedia(siteId, id, data);
  }

  async getStorageUsage(
    siteId: string
  ): Promise<{ bytes: number; mb: number }> {
    return this.mediaService.getStorageUsage(siteId);
  }
}

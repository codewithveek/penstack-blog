/**
 * apps/api/src/vendor.d.ts
 *
 * Type declarations for packages that lack TypeScript types or are not installed
 * (meilisearch is an optional dependency resolved at runtime only when configured).
 */

declare module "meilisearch" {
  export interface SearchParams {
    limit?: number;
    offset?: number;
    filter?: string;
    attributesToHighlight?: string[];
    attributesToRetrieve?: string[];
  }

  export interface SearchResponse<T = Record<string, unknown>> {
    hits: T[];
    offset: number;
    limit: number;
    estimatedTotalHits: number;
  }

  export interface Index<T = Record<string, unknown>> {
    addDocuments(documents: T[]): Promise<{ taskUid: number }>;
    deleteDocument(id: string): Promise<{ taskUid: number }>;
    search(query: string, params?: SearchParams): Promise<SearchResponse<T>>;
  }

  export interface MeiliSearchConfig {
    host: string;
    apiKey?: string;
  }

  export default class MeiliSearch {
    constructor(config: MeiliSearchConfig);
    index<T = Record<string, unknown>>(indexName: string): Index<T>;
  }
}

declare module "@fluxmedia/core" {
  export interface UploadOptions {
    folder?: string;
    filename?: string;
    contentType?: string;
    metadata?: Record<string, string>;
  }

  export interface UploadResult {
    id: string;
    url: string;
    thumbnailUrl?: string;
    size?: number;
    width?: number;
    height?: number;
    provider: string;
  }

  export function getFileType(
    buffer: Buffer
  ): Promise<{ mime: string; ext: string } | null>;

  export class MediaUploader {
    constructor(provider: unknown);
    upload(
      file: Buffer | ReadableStream,
      options?: UploadOptions
    ): Promise<UploadResult>;
    delete(providerId: string): Promise<void>;
    use(plugin: unknown): Promise<void>;
  }
}

declare module "@fluxmedia/r2" {
  import type { MediaUploader } from "@fluxmedia/core";
  export interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
  }
  export class R2Provider extends (null as unknown as typeof import("@fluxmedia/core").MediaUploader) {
    constructor(config: R2Config);
  }
}

declare module "@fluxmedia/s3" {
  export interface S3Config {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
  }
  export class S3Provider extends (null as unknown as typeof import("@fluxmedia/core").MediaUploader) {
    constructor(config: S3Config);
  }
}

declare module "@fluxmedia/cloudinary" {
  export interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    secure?: boolean;
  }
  export class CloudinaryProvider extends (null as unknown as typeof import("@fluxmedia/core").MediaUploader) {
    constructor(config: CloudinaryConfig);
  }
}

declare module "@fluxmedia/plugins" {
  export function createFileValidationPlugin(options: {
    maxSize: number;
    allowedMimeTypes?: string[];
    allowedTypes?: string[];
    useMagicBytes?: boolean;
  }): unknown;
  export function createMetadataExtractionPlugin(options?: {
    extractDimensions?: boolean;
    extractExif?: boolean;
    hashFile?: boolean;
  }): unknown;
  export function createRetryPlugin(options: {
    maxRetries: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
  }): unknown;
}

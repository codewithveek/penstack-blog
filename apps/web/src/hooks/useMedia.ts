"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api-client";

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  createdAt: string;
}

interface MediaMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface MediaResult {
  items: MediaItem[];
  meta: MediaMeta;
}

export function useMedia(params?: { page?: number; limit?: number }) {
  return useQuery<MediaResult>({
    queryKey: ["media", params],
    queryFn: () => mediaApi.list(params) as Promise<MediaResult>,
  });
}

export function useRequestUpload() {
  return useMutation({
    mutationFn: (data: { filename: string; mimeType: string; size: number }) =>
      mediaApi.getUploadToken(data),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });
}

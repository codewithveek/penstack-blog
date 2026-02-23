"use client";

import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaApi } from "@/lib/api-client";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.list({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });

  const items = (data?.items ?? []) as MediaItem[];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Media</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm">No media files yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Upload files from the post editor to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
            const isImage = item.mimeType.startsWith("image/");
            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {isImage ? (
                  <div className="aspect-square relative">
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gray-50">
                    <span className="text-3xl text-gray-300">⊡</span>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {item.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatBytes(item.size)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this file?"))
                      deleteMutation.mutate(item.id);
                  }}
                  className="absolute top-2 right-2 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

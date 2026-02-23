"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api-client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featureImage?: string;
  postCount?: number;
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list() as Promise<Tag[]>,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Tag, "id" | "postCount">) =>
      tagsApi.create(data) as Promise<Tag>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Tag> & { id: string }) =>
      tagsApi.update(id, data) as Promise<Tag>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

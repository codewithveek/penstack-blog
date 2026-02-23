"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api-client";

export interface PostMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
  authors: Array<{ id: string; name: string; avatarUrl?: string }>;
  tags: Array<{ id: string; name: string }>;
  featureImage?: string;
  excerpt?: string;
}

interface PostsResult {
  items: Post[];
  meta: PostMeta;
}

export function usePosts(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery<PostsResult>({
    queryKey: ["posts", params],
    queryFn: () => postsApi.list(params) as Promise<PostsResult>,
  });
}

export function usePost(id: string | undefined) {
  return useQuery<Post>({
    queryKey: ["posts", id],
    queryFn: () => postsApi.get(id!) as Promise<Post>,
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Post>) => postsApi.create(data) as Promise<Post>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Post> & { id: string }) =>
      postsApi.update(id, data) as Promise<Post>,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["posts", vars.id] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUnpublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postsApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersApi } from "@/lib/api-client";

export interface Member {
  id: string;
  name: string | null;
  email: string;
  status: string;
  tier: string;
  createdAt: string;
  subscriptionStatus?: string;
}

export interface MembersMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface MembersResult {
  items: Member[];
  meta: MembersMeta;
}

export function useMembers(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery<MembersResult>({
    queryKey: ["members", params],
    queryFn: () => membersApi.list(params) as Promise<MembersResult>,
  });
}

export function useMemberDetail(id: string | undefined) {
  return useQuery<Member>({
    queryKey: ["members", id],
    queryFn: () => membersApi.get(id!) as Promise<Member>,
    enabled: !!id,
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

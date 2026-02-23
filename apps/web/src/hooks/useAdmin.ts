"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";

const ROLE_WEIGHTS: Record<string, number> = {
  owner: 100,
  admin: 80,
  editor: 60,
  author: 40,
  contributor: 20,
};

export function useAdmin() {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = useCallback(
    (minRole: string) => {
      if (!user) return false;
      const userWeight = ROLE_WEIGHTS[user.role] ?? 0;
      const minWeight = ROLE_WEIGHTS[minRole] ?? 0;
      return userWeight >= minWeight;
    },
    [user]
  );

  return { user, isAuthenticated, hasRole };
}

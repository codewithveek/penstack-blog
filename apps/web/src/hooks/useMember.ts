"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MemberUser {
  id: string;
  name: string | null;
  email: string;
  status: string;
  tier: string;
  avatarUrl?: string;
}

interface MemberAuthState {
  member: MemberUser | null;
  isAuthenticated: boolean;
  setMember: (member: MemberUser | null) => void;
  logout: () => void;
}

export const useMemberStore = create<MemberAuthState>()(
  persist(
    (set) => ({
      member: null,
      isAuthenticated: false,
      setMember: (member) =>
        set({ member, isAuthenticated: member !== null }),
      logout: () => set({ member: null, isAuthenticated: false }),
    }),
    { name: "member-auth" }
  )
);

/** Convenience hook — reads the member session state. */
export function useMember() {
  const { member, isAuthenticated, setMember, logout } = useMemberStore();
  return { member, isAuthenticated, setMember, logout };
}

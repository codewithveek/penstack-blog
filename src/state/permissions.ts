import { create } from "zustand";
import { TPermissions } from "@/types";

interface PermissionsState {
  permissions: TPermissions[];
  setPermissions: (permissions: TPermissions[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}
export const usePermissionsStore = create<PermissionsState>((set) => ({
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),
  isLoading: true,
  setIsLoading: (loading) => set({ loading }),
}));

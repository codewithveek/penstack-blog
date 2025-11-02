import { TaxonomyItem } from "@/types";
import { create } from "zustand";

type TaxonomiesState = {
  type: "categories" | "tags";
  searchTerm: string;
  editItem: TaxonomyItem | null;
  setEditItem: (item: TaxonomyItem | null) => void;
  setType: (type: "categories" | "tags") => void;
  setSearchTerm: (searchTerm: string) => void;
  isItemModalOpen: boolean;
  setIsItemModalOpen: (isOpen: boolean) => void;
  deleteItemId: number | null;
  setDeleteItemId: (id: number | null) => void;
};

export const useTaxonomiesStore = create<TaxonomiesState>((set) => ({
  type: "categories",
  editItem: null,
  deleteItemId: null,
  setDeleteItemId: (id: number | null) => set({ deleteItemId: id }),
  setIsItemModalOpen: (isOpen: boolean) => set({ isItemModalOpen: isOpen }),
  isItemModalOpen: false,
  setEditItem: (item: TaxonomyItem | null) => set({ editItem: item }),
  searchTerm: "",
  setType: (type: "categories" | "tags") => set({ type }),
  setSearchTerm: (searchTerm: string) => set({ searchTerm }),
}));

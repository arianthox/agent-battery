import { create } from "zustand";

type UiState = {
  page: "dashboard" | "accounts" | "settings";
  selectedAccountId: string | null;
  setPage: (page: UiState["page"]) => void;
  setSelectedAccountId: (id: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  page: "dashboard",
  selectedAccountId: null,
  setPage: (page) => set({ page }),
  setSelectedAccountId: (selectedAccountId) => set({ selectedAccountId })
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccountSelectionState {
  selectedAccountId: number | null;
  setSelectedAccount: (id: number | null) => void;
  clear: () => void;
}

export const accountSelectionStore = create<AccountSelectionState>()(
  persist(
    (set) => ({
      selectedAccountId: null,
      setSelectedAccount: (id) => set({ selectedAccountId: id }),
      clear: () => set({ selectedAccountId: null }),
    }),
    {
      name: "potato-account-selection", // localStorage 키
    }
  )
);

export default accountSelectionStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  selectedId: number | null;
  isLogging: boolean;
  completed: boolean;
  setSelectedId: (id: number | null) => void;
  setIsLogging: (v: boolean) => void;
  setCompleted: (v: boolean) => void;
  reset: () => void;
}

/**
 * UI persisted state for Studio4 Account page selection & progress flags.
 */
export const accountUiStore = create<UiState>()(
  persist(
    (set) => ({
      selectedId: null,
      isLogging: false,
      completed: false,
      setSelectedId: (id) => set({ selectedId: id }),
      setIsLogging: (v) => set({ isLogging: v }),
      setCompleted: (v) => set({ completed: v }),
      reset: () =>
        set({ selectedId: null, isLogging: false, completed: false }),
    }),
    {
      name: "account-ui-store",
      partialize: (s) => ({
        selectedId: s.selectedId,
        isLogging: s.isLogging,
        completed: s.completed,
      }),
    }
  )
);

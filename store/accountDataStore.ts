import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PresentBalanceResponseRaw } from "@/hooks/usePresentBalance";

export interface PresentBalanceSnapshot {
  data: PresentBalanceResponseRaw;
  updatedAt: number;
}

interface State {
  // Per-account last successful presentBalance snapshot
  presentBalanceByAccount: Record<number, PresentBalanceSnapshot>;
  setPresentBalance: (
    accountId: number,
    data: PresentBalanceResponseRaw
  ) => void;
  clearAccount: (accountId: number) => void;
  clearAll: () => void;
}

/**
 * Persisted cache for per-account presentBalance. Used as a fallback to avoid UI flicker
 * when navigating across pages before React Query returns fresh data.
 */
export const accountDataStore = create<State>()(
  persist(
    (set) => ({
      presentBalanceByAccount: {},
      setPresentBalance: (accountId, data) =>
        set((s) => ({
          presentBalanceByAccount: {
            ...s.presentBalanceByAccount,
            [accountId]: { data, updatedAt: Date.now() },
          },
        })),
      clearAccount: (accountId) =>
        set((s) => {
          const next = { ...s.presentBalanceByAccount };
          delete next[accountId];
          return { presentBalanceByAccount: next };
        }),
      clearAll: () => set({ presentBalanceByAccount: {} }),
    }),
    {
      name: "account-data-store",
      partialize: (s) => ({
        presentBalanceByAccount: s.presentBalanceByAccount,
      }),
    }
  )
);

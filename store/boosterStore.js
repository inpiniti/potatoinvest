import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const boosterStore = create(
  devtools(
    persist(
      (set, get) => ({
        symbols: [],
        setSymbols: (symbols) => set({ symbols: Array.from(new Set(symbols)) }),
        addSymbol: (symbol) => {
          const current = get().symbols || [];
          if (current.includes(symbol)) return;
          set({ symbols: [...current, symbol] });
        },
        removeSymbol: (symbol) => {
          const current = get().symbols || [];
          set({ symbols: current.filter((s) => s !== symbol) });
        },
        toggleSymbol: (symbol) => {
          const current = get().symbols || [];
          if (current.includes(symbol)) {
            set({ symbols: current.filter((s) => s !== symbol) });
          } else {
            set({ symbols: [...current, symbol] });
          }
        },
        clear: () => set({ symbols: [] }),
      }),
      {
        name: "boosterSymbols",
        getStorage: () => localStorage,
      }
    ),
    { name: "booster" }
  )
);

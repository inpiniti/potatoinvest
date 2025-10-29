import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const selectedStockStore = create(
  devtools(
    persist(
      (set) => ({
        selectedStock: null,
        setSelectedStock: (stock) => set({ selectedStock: stock }),
      }),
      {
        name: "selectedStockStore",
        getStorage: () => localStorage,
      }
    ),
    { name: "selectedStockStore" }
  )
);

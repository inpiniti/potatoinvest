import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const headerStore = create(
  devtools(
    (set) => ({
      left: null,
      setLeft: (left) => set({ left }),
      right: null,
      setRight: (right) => set({ right }),
      title: null,
      setTitle: (title) => set({ title }),
    }),
    { name: "headerStore" }
  )
);

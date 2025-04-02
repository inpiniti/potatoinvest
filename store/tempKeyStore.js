import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const tempKeyStore = create(
  devtools(
    persist(
      (set) => ({
        realKey: {
          password: "test",
          access_token: "", // 접근토큰
          token_type: "", // 접근토큰유형
          expires_in: "", // 접근토큰 유효기간
          access_token_token_expired: "", // 접근토큰 유효기간(일시표시)
        },
        key: {
          password: "test",
          access_token: "", // 접근토큰
          token_type: "", // 접근토큰유형
          expires_in: "", // 접근토큰 유효기간
          access_token_token_expired: "", // 접근토큰 유효기간(일시표시)
        },
        setKey: (key) => set({ key }),
        setRealKey: (realKey) => set({ realKey }),
      }),
      {
        name: "tempKey",
        getStorage: () => localStorage,
      }
    ),
    { name: "tempKey" }
  )
);

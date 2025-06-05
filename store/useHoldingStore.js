import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useHoldingStore = create(
  devtools(
    persist(
      (set) => ({
        // 상태 초기화
        holdingData: [],
        setHoldingData: (data) =>
          set(() => ({
            holdingData: data,
          })),
      }),
      {
        // Zustand 미들웨어 설정
        name: "holdingStore", // 스토어 이름
        getStorage: () => localStorage, // 로컬 스토리지 사용
      }
    ),
    {
      name: "holdingStore", // 스토어 이름
    }
  )
);

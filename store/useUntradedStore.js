import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useUntradedStore = create(
  devtools(
    persist(
      (set) => ({
        // 상태 초기화
        untradedData: [],
        setUntradedData: (data) =>
          set(() => ({
            untradedData: data,
          })),
      }),
      {
        // Zustand 미들웨어 설정
        name: "untradedStore", // 스토어 이름
        getStorage: () => localStorage, // 로컬 스토리지 사용
      }
    ),
    {
      name: "untradedStore", // 스토어 이름
    }
  )
);

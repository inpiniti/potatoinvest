import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const settingStore = create(
  devtools(
    persist(
      (set) => ({
        setting: {
          other: {
            // 최소 예측률
            minPredictRate: 70,

            // 최소매수금액
            minBuyAmount: 10000,

            // 판매 기준 (%)
            sellRate: 2,

            // 물타기 기준 (%)
            buyRate: -10,
          },
        },
        setSetting: (newSetting) =>
          set((state) => ({
            setting: { ...state.setting, ...newSetting },
          })),
      }),
      {
        name: 'setting',
        getStorage: () => localStorage,
      }
    ),
    { name: 'setting' }
  )
);

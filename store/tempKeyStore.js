import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export const tempKeyStore = create(
  devtools(
    persist(
      (set) => ({
        // 하이드레이션 상태 추적
        _hasHydrated: false,
        setHasHydrated: (state) => {
          set({
            _hasHydrated: state,
          });
        },

        realKey: {
          password: 'test',
          access_token: '', // 접근토큰
          token_type: '', // 접근토큰유형
          expires_in: '', // 접근토큰 유효기간
          access_token_token_expired: '', // 접근토큰 유효기간(일시표시)
        },
        key: {
          password: 'test',
          access_token: '', // 접근토큰
          token_type: '', // 접근토큰유형
          expires_in: '', // 접근토큰 유효기간
          access_token_token_expired: '', // 접근토큰 유효기간(일시표시)
        },
        selectedAccountId: undefined, // 선택된 계좌 ID
        setKey: (key) => set({ key }),
        setRealKey: (realKey) => set({ realKey }),
        setSelectedAccountId: (selectedAccountId) => {
          console.log('📝 tempKeyStore - setSelectedAccountId:', selectedAccountId);
          set({ selectedAccountId });
        },
      }),
      {
        name: 'tempKey',
        storage: createJSONStorage(() => localStorage),
        // 하이드레이션 완료 콜백
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
            console.log('✅ tempKeyStore 하이드레이션 완료');
            console.log('📌 복원된 selectedAccountId:', state.selectedAccountId);
          }
        },
      }
    ),
    { name: 'tempKey' }
  )
);

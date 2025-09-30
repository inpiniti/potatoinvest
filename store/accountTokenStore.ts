import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AccountTokenData {
  accountId: number;
  access_token: string;
  token_type?: string;
  expires_in?: string | number;
  access_token_token_expired?: string;
  fetched_at: number;
}

interface State {
  activeAccountId: number | null;
  tokens: Record<number, AccountTokenData>;
  exchangeRate?: number;
  hasHydrated: boolean;
  setActive: (id: number | null) => void;
  setToken: (t: AccountTokenData) => void;
  setExchangeRate: (rate: number | undefined) => void;
  clear: () => void;
  setHasHydrated: () => void;
}

export const accountTokenStore = create<State>()(
  persist(
    (set) => ({
      activeAccountId: null,
      tokens: {},
      hasHydrated: false,
      setActive: (id) => set({ activeAccountId: id }),
      setToken: (t) =>
        set((s) => ({
          tokens: { ...s.tokens, [t.accountId]: t },
          activeAccountId: t.accountId,
        })),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      clear: () =>
        set({ activeAccountId: null, tokens: {}, exchangeRate: undefined }),
      setHasHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: 'account-token-store',
      partialize: (s) => ({
        activeAccountId: s.activeAccountId,
        tokens: s.tokens,
        exchangeRate: s.exchangeRate,
      }),
      onRehydrateStorage: () => (state) => {
        // after rehydration mark flag
        state?.setHasHydrated();
        // dispatch global event so components can respond (optional)
        window.dispatchEvent(new CustomEvent('account-token-hydrated'));
      },
    }
  )
);

import { create } from 'zustand';

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
  setActive: (id: number | null) => void;
  setToken: (t: AccountTokenData) => void;
  clear: () => void;
}

export const accountTokenStore = create<State>((set) => ({
  activeAccountId: null,
  tokens: {},
  setActive: (id) => set({ activeAccountId: id }),
  setToken: (t) => set((s) => ({
    tokens: { ...s.tokens, [t.accountId]: t },
    activeAccountId: t.accountId,
  })),
  clear: () => set({ activeAccountId: null, tokens: {} }),
}));

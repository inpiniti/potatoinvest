"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  accountTokenStore,
  type AccountTokenData,
} from "@/store/accountTokenStore";
import { toast } from "sonner";
import type {
  PresentBalanceParams,
  PresentBalanceResponseRaw,
} from "@/hooks/usePresentBalance";

type PresentBalanceOptions = Omit<
  PresentBalanceParams,
  "accountId" | "kiAccessToken"
>;

interface AccountRecord {
  id: number;
  account_number: string;
  alias?: string | null;
  max_positions?: number | null;
  target_cash_ratio?: number | null;
  created_at?: string;
}

interface AccountsResponse {
  accounts: AccountRecord[];
}

interface DataromaBaseResponse {
  based_on_person?: unknown[];
  based_on_stock?: unknown[];
}

interface StudioMutations {
  addAccount: (payload: {
    accountNumber: string;
    alias?: string;
    apiKey: string;
    apiSecret: string;
  }) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  loginAccount: (id: number) => Promise<void>;
  updateAccountSettings: (payload: {
    accountId: number;
    max_positions: number;
    target_cash_ratio: number;
  }) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshDataroma: () => Promise<void>;
  refreshPresentBalance: () => Promise<void>;
  refreshExchangeRate: () => Promise<void>;
  loginWithKakao: () => Promise<void>;
  logout: () => Promise<void>;
}

interface StudioDataContextValue {
  session: Session | null;
  user: User | null;
  loadingSession: boolean;
  accounts: AccountRecord[];
  accountsLoading: boolean;
  accountsError: unknown;
  dataromaBasedOnPerson: unknown[];
  dataromaBasedOnStock: unknown[];
  dataromaLoading: boolean;
  dataromaError: unknown;
  presentBalance: PresentBalanceResponseRaw | undefined;
  presentBalanceLoading: boolean;
  presentBalanceFetching: boolean;
  presentBalanceError: unknown;
  presentBalanceOptions: PresentBalanceOptions;
  setPresentBalanceOptions: Dispatch<SetStateAction<PresentBalanceOptions>>;
  exchangeRate: number | undefined;
  exchangeRateLoading: boolean;
  exchangeRateError: unknown;
  activeAccountId: number | null;
  setActiveAccount: (id: number | null) => void;
  tokens: Record<number, AccountTokenData>;
  hasHydrated: boolean;
  mutations: StudioMutations;
  // price detail cache & helpers
  getPriceDetail: (
    symb: string
  ) => Promise<{
    last: number;
    perx?: number;
    pbrx?: number;
    epsx?: number;
    bpsx?: number;
    excd_used?: "NAS" | "NYS";
  } | null>;
  getOpenOrdersMap: () => Promise<Record<string, boolean>>; // symbol -> 체결중 여부
}

const StudioDataContext = createContext<StudioDataContextValue | undefined>(
  undefined
);

function requireSession(session: Session | null): Session {
  if (!session) {
    throw new Error("로그인이 필요합니다.");
  }
  return session;
}

function buildHeaders(session: Session): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  } satisfies HeadersInit;
}

export function StudioDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const {
    activeAccountId,
    tokens,
    exchangeRate: storedExchangeRate,
    setActive,
    setToken,
    setExchangeRate,
    clear,
    hasHydrated,
  } = accountTokenStore();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [presentBalanceOptions, setPresentBalanceOptions] =
    useState<PresentBalanceOptions>({
      WCRC_FRCR_DVSN_CD: "02",
    });
  // ephemeral caches (per session)
  type PriceDetailLite = {
    last: number;
    perx?: number;
    pbrx?: number;
    epsx?: number;
    bpsx?: number;
    excd_used?: "NAS" | "NYS";
  };
  const priceCacheRef = useRef<
    Record<string, { t: number; v: PriceDetailLite }>
  >({});
  const openOrdersRef = useRef<{
    t: number;
    map: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .finally(() => {
        if (mounted) setLoadingSession(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const accountsQuery = useQuery<AccountsResponse>({
    queryKey: ["studio", "accounts", session?.user?.id ?? "anon"],
    enabled: Boolean(session),
    queryFn: async () => {
      const currentSession = requireSession(session);
      const res = await fetch("/api/accounts", {
        headers: buildHeaders(currentSession),
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "계좌 조회에 실패했습니다.");
      }
      const json = (await res.json()) as AccountsResponse;
      return { accounts: json.accounts ?? [] };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const dataromaQuery = useQuery<DataromaBaseResponse>({
    queryKey: ["studio", "dataroma-base"],
    queryFn: async () => {
      const res = await fetch("/api/dataroma/base", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Dataroma 데이터를 불러오지 못했습니다.");
      }
      return (await res.json()) as DataromaBaseResponse;
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const presentBalanceQuery = useQuery<PresentBalanceResponseRaw>({
    queryKey: [
      "studio",
      "present-balance",
      activeAccountId,
      tokens[activeAccountId ?? -1]?.access_token,
      presentBalanceOptions,
    ],
    enabled: Boolean(
      session && activeAccountId && tokens[activeAccountId]?.access_token
    ),
    queryFn: async () => {
      const accountId = activeAccountId;
      if (!accountId) {
        throw new Error("활성 계좌가 없습니다.");
      }
      const token = tokens[accountId];
      if (!token?.access_token) {
        throw new Error("토큰이 없습니다.");
      }
      const currentSession = requireSession(session);
      const params: PresentBalanceParams = {
        accountId,
        kiAccessToken: token.access_token,
        ...presentBalanceOptions,
      };
      const res = await fetch("/api/accounts/presentBalance", {
        method: "POST",
        headers: buildHeaders(currentSession),
        body: JSON.stringify(params),
      });
      const json = (await res.json()) as PresentBalanceResponseRaw;
      if (!res.ok || json.rt_cd !== "0") {
        throw new Error(json.msg1 || "잔고 조회에 실패했습니다.");
      }
      return json;
    },
    staleTime: 60_000,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const exchangeRateQuery = useQuery<{ usdToKrw: number } | { error: string }>({
    queryKey: ["studio", "exchange-rate"],
    queryFn: async () => {
      const res = await fetch("/api/exchangeRate", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "환율 조회에 실패했습니다.");
      }
      return (await res.json()) as { usdToKrw: number } | { error: string };
    },
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const data = exchangeRateQuery.data;
    if (data && "usdToKrw" in data && typeof data.usdToKrw === "number") {
      setExchangeRate(data.usdToKrw);
    }
  }, [exchangeRateQuery.data, setExchangeRate]);

  // Helpers: Price detail (per symbol) with short TTL cache (15s)
  const getPriceDetail = useCallback<StudioDataContextValue["getPriceDetail"]>(
    async (symb) => {
      const accountId = activeAccountId;
      const token = accountId ? tokens[accountId]?.access_token : undefined;
      if (!accountId || !token) return null;
      const key = String(symb).toUpperCase();
      const now = Date.now();
      const cached = priceCacheRef.current[key];
      if (cached && now - cached.t < 15_000) {
        return cached.v;
      }
      const currentSession = requireSession(session);
      const res = await fetch("/api/accounts/priceDetail", {
        method: "POST",
        headers: buildHeaders(currentSession),
        body: JSON.stringify({ accountId, kiAccessToken: token, symb: key }),
      });
      if (!res.ok) {
        return null;
      }
      const json = await res.json();
      if (json?.rt_cd !== "0" || !json?.output) return null;
      const out = json.output;
      const lastNum = Number(out?.last);
      if (!isFinite(lastNum)) return null;
      const value: PriceDetailLite = {
        last: lastNum,
        perx: out?.perx != null ? Number(out.perx) : undefined,
        pbrx: out?.pbrx != null ? Number(out.pbrx) : undefined,
        epsx: out?.epsx != null ? Number(out.epsx) : undefined,
        bpsx: out?.bpsx != null ? Number(out.bpsx) : undefined,
        excd_used: (json.excd_used as "NAS" | "NYS" | undefined) ?? undefined,
      };
      priceCacheRef.current[key] = { t: now, v: value };
      return value;
    },
    [activeAccountId, session, tokens]
  );

  // Helpers: Open orders map with short TTL (10s)
  const getOpenOrdersMap = useCallback<
    StudioDataContextValue["getOpenOrdersMap"]
  >(async () => {
    const accountId = activeAccountId;
    const token = accountId ? tokens[accountId]?.access_token : undefined;
    if (!accountId || !token) return {};
    const now = Date.now();
    const cached = openOrdersRef.current;
    if (cached && now - cached.t < 10_000) return cached.map;
    const currentSession = requireSession(session);
    const res = await fetch("/api/accounts/openOrders", {
      method: "POST",
      headers: buildHeaders(currentSession),
      body: JSON.stringify({ accountId, kiAccessToken: token }),
    });
    if (!res.ok) return {};
    const json = await res.json();
    const map: Record<string, boolean> = json?.symbols || {};
    openOrdersRef.current = { t: now, map };
    return map;
  }, [activeAccountId, session, tokens]);

  useEffect(() => {
    if (accountsQuery.error) {
      toast.error(
        accountsQuery.error instanceof Error
          ? accountsQuery.error.message
          : "계좌 정보를 불러오는 중 오류가 발생했습니다."
      );
    }
  }, [accountsQuery.error]);

  useEffect(() => {
    if (dataromaQuery.error) {
      toast.error(
        dataromaQuery.error instanceof Error
          ? dataromaQuery.error.message
          : "데이터로마 정보를 불러오는 중 오류가 발생했습니다."
      );
    }
  }, [dataromaQuery.error]);

  useEffect(() => {
    if (presentBalanceQuery.error) {
      toast.error(
        presentBalanceQuery.error instanceof Error
          ? presentBalanceQuery.error.message
          : "잔고 정보를 불러오는 중 오류가 발생했습니다."
      );
    }
  }, [presentBalanceQuery.error]);

  useEffect(() => {
    if (exchangeRateQuery.error) {
      toast.error(
        exchangeRateQuery.error instanceof Error
          ? exchangeRateQuery.error.message
          : "환율 정보를 불러오는 중 오류가 발생했습니다."
      );
    }
  }, [exchangeRateQuery.error]);

  const addAccountMutation = useMutation({
    mutationFn: async (payload: {
      accountNumber: string;
      alias?: string;
      apiKey: string;
      apiSecret: string;
    }) => {
      const currentSession = requireSession(session);
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: buildHeaders(currentSession),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "계좌 저장에 실패했습니다.");
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["studio", "accounts"] });
      toast.success("계좌가 추가되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "계좌 추가에 실패했습니다.";
      toast.error(message);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const currentSession = requireSession(session);
      const res = await fetch("/api/accounts", {
        method: "DELETE",
        headers: buildHeaders(currentSession),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "계좌 삭제에 실패했습니다.");
      }

      const { tokens: currentTokens, activeAccountId: currentActive } =
        accountTokenStore.getState();
      if (currentTokens[id]) {
        const nextTokens = { ...currentTokens };
        delete nextTokens[id];
        accountTokenStore.setState({ tokens: nextTokens });
        if (currentActive === id) {
          accountTokenStore.getState().setActive(null);
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["studio", "accounts"] });
      toast.success("계좌가 삭제되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "계좌 삭제에 실패했습니다.";
      toast.error(message);
    },
  });

  const loginAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const currentSession = requireSession(session);
      const res = await fetch("/api/accounts/login", {
        method: "POST",
        headers: buildHeaders(currentSession),
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "토큰 발급에 실패했습니다.");
      }

      const tokenData: AccountTokenData = {
        accountId: id,
        access_token: json.access_token,
        token_type: json.token_type,
        expires_in: json.expires_in,
        access_token_token_expired: json.access_token_token_expired,
        fetched_at: Date.now(),
      };
      setToken(tokenData);
      setActive(id);

      try {
        window.dispatchEvent(
          new CustomEvent("account-token-issued", { detail: { accountId: id } })
        );
      } catch {
        /* noop */
      }

      await presentBalanceQuery.refetch();
      await exchangeRateQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["studio", "accounts"] });
    },
    onSuccess: () => {
      toast.success("토큰이 발급되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "토큰 발급에 실패했습니다.";
      toast.error(message);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: {
      accountId: number;
      max_positions: number;
      target_cash_ratio: number;
    }) => {
      const currentSession = requireSession(session);
      const res = await fetch("/api/accounts/settings", {
        method: "PATCH",
        headers: buildHeaders(currentSession),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "설정 저장에 실패했습니다.");
      }

      try {
        window.dispatchEvent(
          new CustomEvent("account-settings-changed", {
            detail: {
              accountId: payload.accountId,
              max_positions: payload.max_positions,
              target_cash_ratio: payload.target_cash_ratio,
              dirty: false,
              source: "save",
            },
          })
        );
      } catch {
        /* noop */
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["studio", "accounts"] });
      toast.success("설정이 저장되었습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "설정을 저장하지 못했습니다.";
      toast.error(message);
    },
  });

  const startKakaoOAuth = useCallback(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const envRedirect = process.env.NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT;
    const redirectTo = envRedirect
      ? envRedirect.startsWith("http")
        ? envRedirect
        : `${origin}${envRedirect}`
      : `${origin}/studio/home`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo },
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clear();
    toast.success("로그아웃되었습니다.");
  }, [clear]);

  const mutations = useMemo<StudioMutations>(
    () => ({
      addAccount: async (payload) => {
        await addAccountMutation.mutateAsync(payload);
      },
      deleteAccount: async (id) => {
        await deleteAccountMutation.mutateAsync(id);
      },
      loginAccount: async (id) => {
        await loginAccountMutation.mutateAsync(id);
      },
      updateAccountSettings: async (payload) => {
        await updateSettingsMutation.mutateAsync(payload);
      },
      refreshAccounts: async () => {
        await accountsQuery.refetch();
      },
      refreshDataroma: async () => {
        await dataromaQuery.refetch();
      },
      refreshPresentBalance: async () => {
        await presentBalanceQuery.refetch();
      },
      refreshExchangeRate: async () => {
        await exchangeRateQuery.refetch();
      },
      loginWithKakao: async () => {
        try {
          await startKakaoOAuth();
          toast.success("카카오 로그인 페이지로 이동합니다.");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "카카오 로그인에 실패했습니다.";
          toast.error(message);
        }
      },
      logout: async () => {
        await signOut();
      },
    }),
    [
      accountsQuery,
      dataromaQuery,
      presentBalanceQuery,
      exchangeRateQuery,
      addAccountMutation,
      deleteAccountMutation,
      loginAccountMutation,
      updateSettingsMutation,
      startKakaoOAuth,
      signOut,
    ]
  );

  const value = useMemo<StudioDataContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loadingSession,
      accounts: accountsQuery.data?.accounts ?? [],
      accountsLoading: accountsQuery.isPending,
      accountsError: accountsQuery.error,
      dataromaBasedOnPerson: dataromaQuery.data?.based_on_person ?? [],
      dataromaBasedOnStock: dataromaQuery.data?.based_on_stock ?? [],
      dataromaLoading: dataromaQuery.isPending,
      dataromaError: dataromaQuery.error,
      presentBalance: presentBalanceQuery.data,
      presentBalanceLoading: presentBalanceQuery.isPending,
      presentBalanceFetching: presentBalanceQuery.isFetching,
      presentBalanceError: presentBalanceQuery.error,
      presentBalanceOptions,
      setPresentBalanceOptions,
      exchangeRate: storedExchangeRate,
      exchangeRateLoading: exchangeRateQuery.isPending,
      exchangeRateError: exchangeRateQuery.error,
      activeAccountId,
      setActiveAccount: setActive,
      tokens,
      hasHydrated,
      mutations,
      getPriceDetail,
      getOpenOrdersMap,
    }),
    [
      session,
      loadingSession,
      accountsQuery.data,
      accountsQuery.isPending,
      accountsQuery.error,
      dataromaQuery.data,
      dataromaQuery.isPending,
      dataromaQuery.error,
      presentBalanceQuery.data,
      presentBalanceQuery.isPending,
      presentBalanceQuery.isFetching,
      presentBalanceQuery.error,
      presentBalanceOptions,
      setPresentBalanceOptions,
      storedExchangeRate,
      exchangeRateQuery.isPending,
      exchangeRateQuery.error,
      activeAccountId,
      setActive,
      tokens,
      hasHydrated,
      mutations,
      getPriceDetail,
      getOpenOrdersMap,
    ]
  );

  return createElement(StudioDataContext.Provider, { value }, children);
}

export function useStudioData() {
  const context = useContext(StudioDataContext);
  if (!context) {
    throw new Error(
      "StudioDataProvider 내부에서만 useStudioData를 사용할 수 있습니다."
    );
  }
  return context;
}

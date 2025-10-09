"use client";
import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountTokenStore } from "@/store/accountTokenStore";
import useKakao from "./useKakao";
import useAssets from "./useAssets";

interface AccountAuthData {
  accountId: number;
  access_token: string;
  access_token_token_expired: number; // epoch ms
  token_type?: string;
  expires_in?: number;
  fetched_at?: number;
  remainingMs: number;
  expired: boolean;
}

export function useAccountAuth(accountId: number | null | undefined) {
  const { tokens, setToken } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const { refetch: assetsRefetch } = useAssets();

  const raw = accountId ? tokens[accountId] : undefined;
  const now = Date.now();
  const shaped: AccountAuthData | null = useMemo(() => {
    if (!accountId || !raw?.access_token) return null;
    // Ensure access_token_token_expired is a number
    let expiredValue: number =
      raw.access_token_token_expired as unknown as number;
    if (typeof expiredValue === "string") {
      expiredValue = Number(expiredValue);
      if (isNaN(expiredValue)) expiredValue = 0;
    }
    if (typeof expiredValue !== "number") expiredValue = 0;

    // Ensure expires_in is a number or undefined
    let expiresInValue: number | undefined = undefined;
    if (raw.expires_in !== undefined) {
      expiresInValue =
        typeof raw.expires_in === "number"
          ? raw.expires_in
          : Number(raw.expires_in);
      if (isNaN(expiresInValue)) expiresInValue = undefined;
    }

    const remainingMs = expiredValue - Date.now();
    return {
      accountId,
      access_token: raw.access_token,
      access_token_token_expired: expiredValue,
      token_type: raw.token_type,
      expires_in: expiresInValue,
      fetched_at: raw.fetched_at,
      remainingMs,
      expired: remainingMs <= 0,
    };
  }, [accountId, raw, now]);

  const query = useQuery<{ data: AccountAuthData | null }>({
    queryKey: ["account-auth", accountId, raw?.access_token_token_expired],
    enabled: !!accountId,
    queryFn: async () => ({ data: shaped }),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (idOverride?: number) => {
      const id = idOverride ?? accountId;
      if (!id) throw new Error("계좌 ID 없음");
      if (!session?.access_token) throw new Error("세션 없음");
      const res = await fetch("/api/accounts/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "계좌 인증 실패");
      }
      setToken({
        accountId: id,
        access_token: json.access_token,
        token_type: json.token_type,
        expires_in: json.expires_in,
        access_token_token_expired: json.access_token_token_expired,
        fetched_at: Date.now(),
      });
      return json;
    },
    onSuccess: () => {
      toast.success("계좌 인증 완료");
      query.refetch();

      // 계좌 인증 성공 시 자산 조회 트리거
      try {
        // window.dispatchEvent(
        //   new CustomEvent("account-auth-success", {
        //     detail: { accountId },
        //   })
        // );
        assetsRefetch();
      } catch {
        /* noop */
      }
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "계좌 인증 실패");
    },
  });

  return {
    data: query.data?.data ?? null,
    refresh: query.refetch,
    authenticate: loginMutation.mutateAsync,
    authenticating: loginMutation.isPending,
  };
}

export default useAccountAuth;

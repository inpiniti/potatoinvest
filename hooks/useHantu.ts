"use client";
import { useMutation } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";
import { toast } from "sonner";
import useKakao from "./useKakao";

interface LoginResult {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  access_token_token_expired?: number | string;
}

/**
 * useHantu: 한국투자증권 로그인/토큰 관리
 * - selectAccount(id): 활성 계좌를 zustand에 저장
 * - login(id?): 서버 POST /api/accounts/login 호출 → 토큰 저장
 */
export function useHantu() {
  const { setActive, setToken, activeAccountId } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const mutation = useMutation<LoginResult, Error, number | undefined>({
    mutationFn: async (idOverride) => {
      const id = idOverride ?? activeAccountId;
      if (!id) throw new Error("계좌 ID가 필요합니다.");
      if (!session?.access_token) throw new Error("로그인이 필요합니다.");
      const res = await fetch("/api/accounts/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "한투 로그인 실패");
      // 토큰 저장 및 활성 계좌 지정
      setToken({
        accountId: id,
        access_token: json.access_token,
        token_type: json.token_type,
        expires_in: json.expires_in,
        access_token_token_expired: String(json.access_token_token_expired),
        fetched_at: Date.now(),
      });
      return json as LoginResult;
    },
    onSuccess: () => toast.success("한투 로그인 완료"),
    onError: (e) => toast.error(e.message),
  });

  return {
    activeAccountId,
    selectAccount: (id: number) => setActive(id),
    login: mutation.mutateAsync,
    loggingIn: mutation.isPending,
  };
}

export default useHantu;

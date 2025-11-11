"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import useKakao from "./useKakao";

export interface BrokerageAccount {
  id: number;
  user_id: string;
  account_no: string;
  api_key: string;
  alias?: string | null;
  created_at?: string;
}

/**
 * useAccounts: Supabase brokerage_accounts 조회
 * - 기본값으로 자동 실행하지 않음 (특정 이벤트에서 refetch 호출)
 * - 필요 시 options.enabled=true로 자동 실행 가능
 */
export function useAccounts(options?: { enabled?: boolean }) {
  const { data: kakao } = useKakao();
  const userId = kakao.user?.id ?? null;

  const query = useQuery<BrokerageAccount[]>({
    queryKey: ["brokerage_accounts", userId],
    enabled: Boolean(options?.enabled && userId),
    refetchOnWindowFocus: false,
    staleTime: Infinity, // 이벤트 기반으로 갱신
    queryFn: async () => {
      if (!userId) throw new Error("로그인 필요");
      const { data, error } = await supabase
        .from("brokerage_accounts")
        .select("id, user_id, account_no, api_key, alias, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BrokerageAccount[];
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useAccounts;

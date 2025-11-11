"use client";
import { useQuery } from "@tanstack/react-query";

export interface DataromaInvestorStockItem {
  stock: string;
  person_count?: number;
  avg_ratio?: string;
  sum_ratio?: string;
  logoid?: string;
  dcf_vs_market_cap_pct?: number;
  bbUpper?: number;
  bbLower?: number;
  close?: number;
  ai?: number;
  person?: Array<{ no: number; name: string; ratio: string }>;
}

export interface DataromaInvestorItem {
  no: number;
  name: string;
  totalValue?: string;
  totalValueNum?: number;
  portfolio?: Array<{ code: string; ratio: string }>;
}

export interface DataromaBaseResponse {
  based_on_person?: DataromaInvestorItem[];
  based_on_stock?: DataromaInvestorStockItem[];
}

/**
 * useInvestor
 * - GET /api/dataroma/base?withDetails=true
 * - 5분 캐시 + 5분 간격 재조회
 */
export function useInvestor(options?: { enabled?: boolean }) {
  const query = useQuery<DataromaBaseResponse>({
    queryKey: ["dataroma", "base", { withDetails: true }],
    queryFn: async () => {
      const res = await fetch("/api/dataroma/base?withDetails=true", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as DataromaBaseResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });

  return {
    data: query.data,
    investors: query.data?.based_on_person ?? [],
    stocks: query.data?.based_on_stock ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useInvestor;

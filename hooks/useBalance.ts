"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";
import useKakao from "./useKakao";

interface HoldingStock {
  pdno?: string; // 상품번호 (종목코드)
  prdt_name?: string; // 종목명
  cblc_qty13?: string; // 결제보유수량
  thdt_buy_ccld_qty1?: string; // 당일매수체결수량
  thdt_sll_ccld_qty1?: string; // 당일매도체결수량
  ccld_qty_smtl1?: string; // 체결수량합계 (체결기준 현재 보유수량)
  ord_psbl_qty1?: string; // 주문가능수량
  frcr_pchs_amt?: string; // 외화매입금액
  frcr_evlu_amt2?: string; // 외화평가금액
  evlu_pfls_amt2?: string; // 평가손익금액 (외화기준)
  evlu_pfls_rt1?: string; // 평가손익률
  bass_exrt?: string; // 기준환율
  buy_crcy_cd?: string; // 매수통화코드 (USD, HKD, CNY, JPY, VND)
  ovrs_now_pric1?: string; // 해외현재가격
  avg_unpr3?: string; // 평균단가
  tr_mket_name?: string; // 거래시장명
  natn_kor_name?: string; // 국가한글명
  pchs_rmnd_wcrc_amt?: string; // 매입잔액원화금액
  thdt_buy_ccld_frcr_amt?: string; // 당일매수체결외화금액
  thdt_sll_ccld_frcr_amt?: string; // 당일매도체결외화금액
  unit_amt?: string; // 단위금액
  std_pdno?: string; // 표준상품번호
  prdt_type_cd?: string; // 상품유형코드
  scts_dvsn_name?: string; // 유가증권구분명
  loan_rmnd?: string; // 대출잔액
  loan_dt?: string; // 대출일자
  loan_expd_dt?: string; // 대출만기일자
  ovrs_excg_cd?: string; // 해외거래소코드
  item_lnkg_excg_cd?: string; // 종목연동거래소코드

  // Legacy fields (호환성 유지)
  hldg_qty?: string; // deprecated, use cblc_qty13 or ccld_qty_smtl1
  pchs_avg_pric?: string; // deprecated, use avg_unpr3
  prpr?: string; // deprecated, use ovrs_now_pric1
  evlu_amt?: string; // deprecated, use frcr_evlu_amt2
  evlu_pfls_amt?: string; // deprecated, use evlu_pfls_amt2
  evlu_pfls_rt?: string; // deprecated, use evlu_pfls_rt1
}

interface AssetSummary {
  tot_asst_amt?: string;
  tot_dncl_amt?: string;
  evlu_amt_smtl?: string;
  evlu_pfls_amt_smtl?: string;
  evlu_erng_rt1?: string;
  wdrw_psbl_tot_amt?: string;
  frcr_evlu_tota?: string;
  ustl_buy_amt_smtl?: string;
  pchs_amt_smtl_amt?: string;
  evlu_amt_smtl_amt?: string;
}

interface PresentBalanceResponse {
  rt_cd?: string;
  msg1?: string;
  output1?: HoldingStock[];
  output3?: AssetSummary[];
}

/**
 * useBalance: 계좌 잔고/보유종목 조회
 * - 조건: activeAccountId + 해당 토큰 존재
 * - 최초 조회 후 5분 간격으로 자동 갱신
 */
export function useBalance() {
  const { activeAccountId, tokens } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const query = useQuery<PresentBalanceResponse>({
    queryKey: [
      "balance",
      activeAccountId,
      tokens[activeAccountId ?? -1]?.access_token,
    ],
    enabled: Boolean(
      session && activeAccountId && tokens[activeAccountId]?.access_token
    ),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const accountId = activeAccountId!;
      const token = tokens[accountId]!;
      const res = await fetch("/api/accounts/presentBalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
          WCRC_FRCR_DVSN_CD: "02",
        }),
      });
      const json = (await res.json()) as PresentBalanceResponse;
      if (!res.ok || json.rt_cd !== "0")
        throw new Error(json.msg1 || "잔고 조회 실패");
      return json;
    },
  });

  const holdings = useMemo(
    () => (Array.isArray(query.data?.output1) ? query.data?.output1 ?? [] : []),
    [query.data?.output1]
  );
  const assetInfo = useMemo(() => query.data?.output3, [query.data?.output3]);

  return {
    holdings,
    assetInfo,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useBalance;

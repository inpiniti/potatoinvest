"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";

// 보유 종목 타입
interface HoldingStock {
  pdno?: string; // 상품번호 (종목코드)
  prdt_name?: string; // 상품명
  hldg_qty?: string; // 보유수량
  pchs_avg_pric?: string; // 매입평균가격
  pchs_amt?: string; // 매입금액
  prpr?: string; // 현재가
  evlu_amt?: string; // 평가금액
  evlu_pfls_amt?: string; // 평가손익금액
  evlu_pfls_rt?: string; // 평가손익률
  evlu_erng_rt?: string; // 평가수익률
  frcr_pchs_amt1?: string; // 외화매입금액
  frcr_evlu_amt2?: string; // 외화평가금액
  frcr_evlu_pfls_amt2?: string; // 외화평가손익금액
}

// 자산 정보 타입
interface AssetSummary {
  dnca_tot_amt?: string; // 예수금총금액
  nxdy_excc_amt?: string; // 익일정산금액
  prvs_rcdl_excc_amt?: string; // 가수도정산금액
  cma_evlu_amt?: string; // CMA평가금액
  bfdy_buy_amt?: string; // 전일매수금액
  thdt_buy_amt?: string; // 금일매수금액
  nxdy_auto_rdpt_amt?: string; // 익일자동상환금액
  bfdy_sll_amt?: string; // 전일매도금액
  thdt_sll_amt?: string; // 금일매도금액
  d2_auto_rdpt_amt?: string; // D+2자동상환금액
  bfdy_tlex_amt?: string; // 전일제비용금액
  thdt_tlex_amt?: string; // 금일제비용금액
  tot_loan_amt?: string; // 총대출금액
  scts_evlu_amt?: string; // 유가평가금액
  tot_evlu_amt?: string; // 총평가금액
  nass_amt?: string; // 순자산금액
  fncg_gld_auto_rdpt_yn?: string; // 융자금자동상환여부
  pchs_amt_smtl_amt?: string; // 매입금액합계금액
  evlu_amt_smtl_amt?: string; // 평가금액합계금액
  evlu_pfls_smtl_amt?: string; // 평가손익합계금액
  tot_stln_slng_chgs?: string; // 총대주매각대금
  bfdy_tot_asst_evlu_amt?: string; // 전일총자산평가금액
  asst_icdc_amt?: string; // 자산증감액
  asst_icdc_erng_rt?: string; // 자산증감수익률
  tot_asst_amt?: string; // 총자산금액
  tot_dncl_amt?: string; // 총예수금금액
  evlu_amt_smtl?: string; // 평가금액합계
  evlu_pfls_amt_smtl?: string; // 평가손익금액합계
  evlu_erng_rt1?: string; // 평가수익률1
  frcr_buy_amt_smtl1?: string; // 외화매수금액합계1
  ustl_buy_amt_smtl?: string; // 미결제매수금액합계
  frcr_evlu_tota?: string; // 외화평가총액
  wdrw_psbl_tot_amt?: string; // 출금가능총금액
}

interface PresentBalanceResponse {
  rt_cd?: string;
  msg_cd?: string;
  msg1?: string;
  output1?: HoldingStock[];
  output2?: unknown[];
  output3?: AssetSummary[];
}

export function useAssets() {
  const { activeAccountId, tokens } = accountTokenStore();

  // 잔고 조회
  const query = useQuery<PresentBalanceResponse>({
    queryKey: [
      "assets",
      "present-balance",
      activeAccountId,
      tokens[activeAccountId ?? -1]?.access_token,
    ],
    enabled: Boolean(activeAccountId && tokens[activeAccountId]?.access_token),
    queryFn: async () => {
      const accountId = activeAccountId;
      if (!accountId) {
        throw new Error("활성 계좌가 없습니다.");
      }
      const token = tokens[accountId];
      if (!token?.access_token) {
        throw new Error("토큰이 없습니다.");
      }

      const res = await fetch("/api/accounts/presentBalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
          WCRC_FRCR_DVSN_CD: "02", // 기본값: 외화
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "잔고 조회에 실패했습니다.");
      }

      const json = (await res.json()) as PresentBalanceResponse;
      if (json.rt_cd !== "0") {
        throw new Error(json.msg1 || "잔고 조회에 실패했습니다.");
      }

      return json;
    },
    staleTime: 60_000, // 1분
    refetchOnWindowFocus: false,
  });

  // 보유 종목 리스트 (output1)
  const holdings = Array.isArray(query.data?.output1) ? query.data.output1 : [];

  // 자산 정보 (output3의 첫 번째 항목)
  const assetInfo = Array.isArray(query.data?.output3)
    ? query.data.output3[0]
    : undefined;

  // 계좌 인증 성공 시 자산 조회
  useEffect(() => {
    function handleAuthSuccess(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (!detail?.accountId) return;

      // 현재 활성 계좌가 인증된 계좌와 같을 때만 조회
      if (detail.accountId === activeAccountId) {
        query.refetch();
      }
    }

    window.addEventListener("account-auth-success", handleAuthSuccess);
    return () =>
      window.removeEventListener("account-auth-success", handleAuthSuccess);
  }, [activeAccountId, query]);

  // 초기 조회: 토큰이 있고 데이터가 없으면 자동 조회
  useEffect(() => {
    if (!activeAccountId) return;

    const hasToken = Boolean(tokens[activeAccountId]?.access_token);
    const hasData = holdings.length > 0 || assetInfo !== undefined;

    // 토큰이 있고 데이터가 없으면 조회
    if (hasToken && !hasData && !query.isFetching) {
      query.refetch();
    }
  }, [activeAccountId, tokens, holdings.length, assetInfo, query]);

  return {
    // 데이터
    holdings, // 보유 종목 리스트
    assetInfo, // 자산 정보

    // 쿼리 상태
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,

    // 조회 함수
    refetch: query.refetch,
  };
}

export default useAssets;

"use client";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";
import useKakao from "./useKakao";

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

// 자산 정보 타입 (실제 API 응답 구조)
interface AssetSummary {
  pchs_amt_smtl?: string; // 매입금액합계
  evlu_amt_smtl?: string; // 평가금액합계
  evlu_pfls_amt_smtl?: string; // 평가손익금액합계
  dncl_amt?: string; // 예수금
  cma_evlu_amt?: string; // CMA평가금액
  tot_dncl_amt?: string; // 총예수금
  etc_mgna?: string; // 기타증거금
  wdrw_psbl_tot_amt?: string; // 출금가능총금액
  frcr_evlu_tota?: string; // 외화평가총액
  evlu_erng_rt1?: string; // 평가수익률
  pchs_amt_smtl_amt?: string; // 매입금액합계금액
  evlu_amt_smtl_amt?: string; // 평가금액합계금액
  tot_evlu_pfls_amt?: string; // 총평가손익금액
  tot_asst_amt?: string; // 총자산금액
  buy_mgn_amt?: string; // 매수증거금
  mgna_tota?: string; // 증거금총액
  frcr_use_psbl_amt?: string; // 외화사용가능금액
  ustl_sll_amt_smtl?: string; // 미결제매도금액합계
  ustl_buy_amt_smtl?: string; // 미결제매수금액합계
  tot_frcr_cblc_smtl?: string; // 총외화잔고합계
  tot_loan_amt?: string; // 총대출금액
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
  const { data: kakao } = useKakao();
  const session = kakao.session;

  // 잔고 조회
  const query = useQuery<PresentBalanceResponse>({
    queryKey: [
      "assets",
      "present-balance",
      activeAccountId,
      tokens[activeAccountId ?? -1]?.access_token,
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
      if (!session?.access_token) {
        throw new Error("세션이 없습니다.");
      }

      const res = await fetch("/api/accounts/presentBalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
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
  const holdings = useMemo(
    () => (Array.isArray(query.data?.output1) ? query.data.output1 : []),
    [query.data?.output1]
  );

  // 자산 정보 (output3의 첫 번째 항목)
  const assetInfo = useMemo(() => query.data?.output3, [query.data?.output3]);

  // 계좌 인증 성공 시 자산 조회
  // useEffect(() => {
  //   function handleAuthSuccess(ev: Event) {
  //     const detail = (ev as CustomEvent).detail;
  //     if (!detail?.accountId) return;

  //     // 현재 활성 계좌가 인증된 계좌와 같을 때만 조회
  //     if (detail.accountId === activeAccountId) {
  //       query.refetch();
  //     }
  //   }

  //   window.addEventListener("account-auth-success", handleAuthSuccess);
  //   return () =>
  //     window.removeEventListener("account-auth-success", handleAuthSuccess);
  // }, [activeAccountId, query]);

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

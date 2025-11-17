"use client";
import { useQuery } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";
import useKakao from "./useKakao";

/**
 * 미체결 내역 개별 항목
 */
interface UnconcludedItem {
  ord_dt?: string; // 주문일자
  ord_gno_brno?: string; // 주문점번호
  odno?: string; // 주문번호
  orgn_odno?: string; // 원주문번호
  sll_buy_dvsn_cd?: string; // 매도매수구분코드 (01:매도, 02:매수)
  sll_buy_dvsn_cd_name?: string; // 매도매수구분명
  rvse_cncl_dvsn?: string; // 정정취소구분
  rvse_cncl_dvsn_name?: string; // 정정취소구분명
  pdno?: string; // 상품번호(종목코드)
  prdt_name?: string; // 상품명(종목명)
  ft_ord_qty?: string; // 외화주문수량
  ft_ord_unpr3?: string; // 외화주문단가
  ft_ccld_qty?: string; // 외화체결수량
  ft_ccld_unpr3?: string; // 외화체결단가
  ft_ccld_amt3?: string; // 외화체결금액
  nccs_qty?: string; // 미체결수량
  prcs_stat_name?: string; // 처리상태명
  rjct_rson?: string; // 거부사유
  ord_tmd?: string; // 주문시각
  tr_mket_name?: string; // 거래시장명
  tr_natn?: string; // 거래국가
  tr_natn_name?: string; // 거래국가명
  ovrs_excg_cd?: string; // 해외거래소코드
  [key: string]: string | undefined; // 기타 필드
}

/**
 * 미체결 내역 응답 구조
 */
interface UnconcludedResponse {
  rt_cd?: string; // 응답코드 ("0": 성공)
  msg_cd?: string; // 메시지코드
  msg1?: string; // 메시지
  ctx_area_fk200?: string; // 연속조회검색조건200
  ctx_area_nk200?: string; // 연속조회키200
  output?: UnconcludedItem[]; // 미체결 내역 배열
}

/**
 * useUnconcluded
 * - 계좌의 해외주식 미체결 내역 조회
 * - NASD(미국 전체) 고정
 * - 1분 캐시 및 자동 갱신
 */
export function useNcss({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const { activeAccountId, tokens } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const query = useQuery<UnconcludedResponse>({
    queryKey: ["ncss", activeAccountId],
    enabled: Boolean(
      enabled &&
        session &&
        activeAccountId &&
        tokens[activeAccountId]?.access_token
    ),
    staleTime: 1 * 60 * 1000, // 1분 캐시
    refetchInterval: 1 * 60 * 1000, // 1분마다 자동 갱신
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!activeAccountId) {
        throw new Error("계좌가 선택되지 않았습니다");
      }

      const accountId = activeAccountId;
      const token = tokens[accountId]!;

      const res = await fetch("/api/overseas/nccs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
        }),
      });

      const data = (await res.json()) as UnconcludedResponse;

      if (!res.ok || data.rt_cd !== "0") {
        throw new Error(data.msg1 || "미체결 내역 조회 실패");
      }

      return data;
    },
  });

  return {
    data: query.data,
    items: query.data?.output ?? [],
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useNcss;

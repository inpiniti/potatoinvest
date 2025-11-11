"use client";
import { useQuery } from "@tanstack/react-query";
import { accountTokenStore } from "@/store/accountTokenStore";
import useKakao from "./useKakao";

interface TimeChartItem {
  xymd?: string; // 일자
  xhms?: string; // 시간
  last?: string; // 종가
  open?: string; // 시가
  high?: string; // 고가
  low?: string; // 저가
  tvol?: string; // 거래량
}

interface PriceDetailResponse {
  rt_cd?: string;
  msg1?: string;
  output?: {
    last?: string; // 현재가
    base?: string; // 전일종가
    // ... 기타 상세 필드
  };
}

interface TimeChartResponse {
  rt_cd?: string;
  msg1?: string;
  output2?: TimeChartItem[];
}

interface BollingerResult {
  upper: number;
  middle: number;
  lower: number;
}

/**
 * 볼린저밴드 계산 함수
 * @param values 종가 배열 (0번째가 최신, 뒤로 갈수록 과거)
 * @param period 이동평균 기간 (기본 20)
 * @param k 표준편차 배수 (기본 2)
 */
function calcBollinger(
  values: number[],
  period = 20,
  k = 2
): BollingerResult | null {
  if (values.length < period) return null;

  // 0번째가 최신이므로 처음 period개 데이터 사용
  const slice = values.slice(0, period);
  const avg = slice.reduce((a, b) => a + b, 0) / period;

  // 표본 표준편차 사용 (N-1로 나눔) - 일반적인 차트 도구들이 사용
  const variance =
    slice.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / (period - 1);
  const std = Math.sqrt(variance);

  return {
    upper: avg + k * std,
    middle: avg,
    lower: avg - k * std,
  };
}

/**
 * useBollingerBand
 * - 시장(exchange)과 종목코드(symbol)로 5분봉 데이터 조회
 * - 5분봉 기준 볼린저밴드 계산 (기본 20봉, k=2)
 * - 현재가 상세 조회 추가
 */
export function useBollingerBand({
  exchange,
  symbol,
  period = 20,
  k = 2,
  enabled = true,
}: {
  exchange: string | undefined;
  symbol: string | undefined;
  period?: number;
  k?: number;
  enabled?: boolean;
}) {
  const { activeAccountId, tokens } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const query = useQuery<{
    priceDetail: PriceDetailResponse;
    timeChart: TimeChartItem[];
    bands: BollingerResult | null;
    currentPrice: number;
  }>({
    queryKey: ["bollinger-5min", exchange, symbol, period, k, activeAccountId],
    enabled: Boolean(
      enabled &&
        exchange &&
        symbol &&
        session &&
        activeAccountId &&
        tokens[activeAccountId]?.access_token
    ),
    staleTime: 1 * 60 * 1000, // 1분 캐시
    refetchInterval: 1 * 60 * 1000, // 1분마다 자동 갱신
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!exchange || !symbol || !activeAccountId) {
        throw new Error("Required parameters missing");
      }

      const accountId = activeAccountId;
      const token = tokens[accountId]!;

      // 거래소 코드 매핑
      const EXCHANGE_MAP: Record<string, string> = {
        NASDAQ: "NAS",
        NYSE: "NYS",
        AMEX: "AMS",
      };
      const excd = EXCHANGE_MAP[exchange] || exchange;

      // 1. 현재가 상세 조회
      const priceDetailRes = await fetch("/api/overseas/price-detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
          excd,
          symb: symbol,
        }),
      });
      const priceDetail = (await priceDetailRes.json()) as PriceDetailResponse;

      if (!priceDetailRes.ok || priceDetail.rt_cd !== "0") {
        throw new Error(priceDetail.msg1 || "가격 상세 조회 실패");
      }

      // 2. 5분봉 데이터 조회 (최대 120개)
      const timeChartRes = await fetch("/api/overseas/time-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
          excd,
          symb: symbol,
          nmin: "5", // 5분봉
          nrec: "120", // 최대 120개
        }),
      });
      const timeChartData = (await timeChartRes.json()) as TimeChartResponse;

      if (!timeChartRes.ok || timeChartData.rt_cd !== "0") {
        throw new Error(timeChartData.msg1 || "분봉 조회 실패");
      }

      const timeChart = Array.isArray(timeChartData.output2)
        ? timeChartData.output2
        : [];

      // 3. 볼린저밴드 계산 (종가 기준)
      const closes = timeChart.map((item) => Number(item.last || 0));
      const bands = calcBollinger(closes, period, k);

      // 4. 현재가 추출
      const currentPrice = Number(priceDetail.output?.last || 0);

      return {
        priceDetail,
        timeChart,
        bands,
        currentPrice,
      };
    },
  });

  return {
    priceDetail: query.data?.priceDetail,
    timeChart: query.data?.timeChart ?? [],
    bands: query.data?.bands,
    currentPrice: query.data?.currentPrice ?? 0,
    upper: query.data?.bands?.upper,
    middle: query.data?.bands?.middle,
    lower: query.data?.bands?.lower,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useBollingerBand;

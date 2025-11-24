'use client';
import { useQuery } from '@tanstack/react-query';
import { accountTokenStore } from '@/store/accountTokenStore';
import useKakao from './useKakao';

const kValues = [
  0.12566, 0.25335, 0.38532, 0.5244, 0.67449, 0.84162, 1.03643, 1.28155,
  1.64485, 2, 3,
];

/**
 * 볼린저밴드 계산 함수
 * @param values 종가 배열 (0번째가 최신, 뒤로 갈수록 과거)
 * @param period 이동평균 기간 (기본 20)
 * @param k 표준편차 배수 (기본 2)
 */
function calcBollinger(values, period = 20, k = 2) {
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
  useDaily = false,
}) {
  const { activeAccountId, tokens } = accountTokenStore();
  const { data: kakao } = useKakao();
  const session = kakao.session;

  const query = useQuery({
    queryKey: [
      'bollinger-5min',
      exchange,
      symbol,
      period,
      k,
      activeAccountId,
      useDaily,
    ],
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
        throw new Error('Required parameters missing');
      }

      const accountId = activeAccountId;
      const token = tokens?.[accountId];

      // 거래소 코드 매핑
      const EXCHANGE_MAP = {
        NASDAQ: 'NAS',
        NYSE: 'NYS',
        AMEX: 'AMS',
      };
      const excd = EXCHANGE_MAP[exchange] || exchange;

      // 1. 현재가 상세 조회
      const priceDetailRes = await fetch('/api/overseas/price-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token?.access_token,
          excd,
          symb: symbol,
        }),
      });
      const priceDetail = await priceDetailRes.json();

      if (!priceDetailRes.ok || priceDetail.rt_cd !== '0') {
        throw new Error(priceDetail.msg1 || '가격 상세 조회 실패');
      }

      // 2. 5분봉 데이터 조회 (최대 120개)
      const timeChartRes = await fetch('/api/overseas/time-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          kiAccessToken: token.access_token,
          excd,
          symb: symbol,
          nmin: '5', // 5분봉
          nrec: '120', // 최대 120개
        }),
      });
      const timeChartData = await timeChartRes.json();

      if (!timeChartRes.ok || timeChartData.rt_cd !== '0') {
        throw new Error(timeChartData.msg1 || '분봉 조회 실패');
      }

      const timeChart = Array.isArray(timeChartData.output2)
        ? timeChartData.output2
        : [];

      // 3. 볼린저밴드 계산 (종가 기준)
      const closes = timeChart.map((item) => Number(item.last || 0));
      const bands = calcBollinger(closes, period, k);

      // optional: daily (기간별) 조회 및 볼린저 계산
      let dailyTimeChart = undefined;
      let dailyBands = undefined;
      if (useDaily) {
        try {
          const daysBack = Math.max(period * 3, period + 10);
          const fmt = (d) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}${mm}${dd}`;
          };
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - daysBack);

          const startDate = fmt(start);
          const endDate = fmt(end);

          const dailyRes = await fetch('/api/overseas/daily-chart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              accountId,
              kiAccessToken: token.access_token,
              excd,
              symb: symbol,
              startDate,
              endDate,
              nrec: String(daysBack),
            }),
          });

          const dailyData = await dailyRes.json().catch(() => ({}));
          if (!dailyRes.ok || (dailyData.rt_cd && dailyData.rt_cd !== '0')) {
            console.warn(
              'daily-chart fetch failed',
              dailyData?.msg1 || dailyRes.status
            );
          } else {
            const arr = Array.isArray(dailyData.output2)
              ? dailyData.output2
              : Array.isArray(dailyData.output)
              ? dailyData.output
              : [];

            const sorted = arr
              .slice()
              .sort((a, b) => (b.xymd || '').localeCompare(a.xymd || ''));
            dailyTimeChart = sorted;
            const closesDaily = sorted.map((it) => Number(it.clos || 0));

            dailyBands = {};
            for (const val of kValues) {
              dailyBands[val] = calcBollinger(closesDaily, period, val);
            }
          }
        } catch (err) {
          console.warn('daily-chart error', err);
        }
      }

      // 4. 현재가 추출
      const currentPrice = Number(priceDetail.output?.last || 0);

      return {
        priceDetail,
        timeChart,
        dailyTimeChart,
        bands,
        dailyBands,
        currentPrice,
      };
    },
  });

  return {
    priceDetail: query.data?.priceDetail,
    timeChart: query.data?.timeChart ?? [],
    dailyTimeChart: query.data?.dailyTimeChart ?? [],
    bands: query.data?.bands,
    dailyBands: query.data?.dailyBands,
    currentPrice: query.data?.currentPrice ?? 0,
    upper: query.data?.bands?.upper,
    middle: query.data?.bands?.middle,
    lower: query.data?.bands?.lower,
    dailyUpper: query.data?.dailyBands?.upper,
    dailyMiddle: query.data?.dailyBands?.middle,
    dailyLower: query.data?.dailyBands?.lower,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useBollingerBand;

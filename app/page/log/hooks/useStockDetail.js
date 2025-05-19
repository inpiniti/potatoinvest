import { useState, useCallback } from 'react';
import useQuotations from '@/hooks/useQuotations';
import { toast } from 'sonner';

const useStockDetail = () => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 현재가상세 } = useQuotations();

  // 종목 상세 정보 조회 함수
  const fetchStockDetail = useCallback(
    async (stockCode, options = {}) => {
      // 종목코드가 비어 있거나 유효하지 않은 경우
      if (!stockCode || typeof stockCode !== 'string' || !stockCode.trim()) {
        toast.error('유효한 종목코드가 없습니다');
        return null;
      }

      // 종목코드에서 공백 제거
      const cleanStockCode = stockCode.trim();

      setLoading(true);
      setError(null);

      try {
        toast.info(`${cleanStockCode} 종목 현재가 조회 중...`);
        const detail = await 현재가상세(cleanStockCode);

        console.log('==== 종목 상세 정보 ====');
        console.log('종목코드:', cleanStockCode);
        console.log('현재가 API 응답 데이터', detail);
        console.log('분석 or 체결 or 구매 데이터', options.stockObject);

        // 상세 데이터 설정
        setDetailData(detail);

        if (detail) {
          toast.success(
            `${cleanStockCode} 현재가: $${Number(detail.last).toFixed(2)}`
          );

          // 매수 조건 확인 및 실행
          if (
            options.autoBuy &&
            shouldAutoBuy(
              options.activeTab,
              detail,
              options.buyCondition,
              options.체결데이터,
              options.stockObject
            )
          ) {
            if (options.onBuy) {
              options.onBuy(cleanStockCode, detail);
            }
          }

          // 매도 조건 확인 및 실행
          if (
            options.autoSell &&
            options.activeTab === '구매' &&
            options.stockObject &&
            options.onSell
          ) {
            // 매도 조건 체크 - 수익률 2% 이상
            const profitRate = parseFloat(options.stockObject.evlu_pfls_rt); // 잔고인듯, 잔고의 손익률임
            const shouldSell = !isNaN(profitRate) && profitRate >= 2;

            // 체결 중인지 확인
            const isPending = options.체결데이터?.some((order) => {
              const stockCode =
                options.stockObject.name ||
                options.stockObject.code ||
                options.stockObject.ovrs_pdno ||
                options.stockObject.pdno;
              const orderCode = order.name || order.pdno;
              return orderCode === stockCode;
            });

            if (shouldSell && !isPending) {
              console.log(
                `[${cleanStockCode}] 자동 매도 조건 충족: 수익률 ${profitRate}%`
              );

              // 보유 수량 추출
              const sellQuantity = options.stockObject.ord_psbl_qty
                ? parseInt(options.stockObject.ord_psbl_qty)
                : 0;

              // 평균 매수가
              const avgPrice = options.stockObject.pchs_avg_pric || 0;

              if (sellQuantity > 0) {
                // 이 부분 잘못됨
                options.onSell(cleanStockCode, detail, sellQuantity, avgPrice);
                // 위 코드 대신 현재가도 넘기도록 변경
                options.onSell(
                  cleanStockCode,
                  detail,
                  sellQuantity,
                  avgPrice,
                  detail.last
                );
              }
            }
          }
        } else {
          toast.warning(`${cleanStockCode} 현재가 조회 결과 없음`);
        }

        return detail;
      } catch (error) {
        console.error('종목 상세 정보 조회 실패:', error);
        setError('종목 상세 정보를 가져오는데 실패했습니다.');
        toast.error(`${cleanStockCode} 현재가 조회 실패`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [현재가상세]
  );

  // 자동 매수 조건 확인 함수
  const shouldAutoBuy = (
    activeTab,
    detail,
    buyCondition,
    체결데이터,
    stockObject
  ) => {
    // 상세 정보가 없으면 매수하지 않음
    if (!detail || !detail.last) return false;

    // 체결 중인지 확인
    if (체결데이터 && stockObject) {
      const stockCode =
        stockObject.name ||
        stockObject.code ||
        stockObject.ovrs_pdno ||
        stockObject.pdno;

      const isPending = 체결데이터.some((order) => {
        const orderCode = order.name || order.pdno;
        return orderCode === stockCode;
      });

      if (isPending) {
        console.log(`[${stockCode}] 체결 중이므로 자동 매수/매도 불가`);
        return false;
      }
    }

    // 탭별 매수 조건
    switch (activeTab) {
      case '분석':
        // 분석 탭에서는 조건 없이 모든 종목 매수
        return true;

      case '구매':
        // 보유종목 탭에서는 -10% 이하인 종목만 매수
        const evluPflsRt = buyCondition?.evluPflsRt;

        // 평가손익률이 -10% 이하인 경우만 매수
        if (evluPflsRt !== undefined && evluPflsRt !== null) {
          // evlu_pfls_rt는 문자열 퍼센트 값으로 제공될 수 있으므로 숫자로 변환
          const profitRate =
            typeof evluPflsRt === 'string'
              ? parseFloat(evluPflsRt.replace('%', ''))
              : Number(evluPflsRt);

          console.log(`[${detail.rsym}] 평가손익률: ${profitRate}%`);
          return profitRate <= -10; // -10% 이하 손실 중인 종목만 매수
        }

        return false;

      default:
        return false;
    }
  };

  return {
    detailData,
    loading,
    error,
    fetchStockDetail,
  };
};

export default useStockDetail;

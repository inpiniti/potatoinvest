import { useState, useCallback, useEffect } from 'react';
import useQuotations from '@/hooks/useQuotations';
import { toast } from 'sonner';
import { settingStore } from '@/store/settingStore';

const useStockDetail = () => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 현재가상세 } = useQuotations();

  // 추가: settingStore에서 설정값 가져오기
  const { setting } = settingStore();
  const [detailSettings, setDetailSettings] = useState({
    buyRate: -10,
    sellRate: 2,
  });

  // 추가: 설정값 로드
  useEffect(() => {
    if (setting && setting.other) {
      setDetailSettings({
        buyRate: setting.other.buyRate || -10,
        sellRate: setting.other.sellRate || 2,
      });
    }
  }, [setting]);

  // 자동 매수 조건 확인 함수 (useCallback으로 래핑)
  const shouldAutoBuy = useCallback(
    (activeTab, detail, buyCondition, 체결데이터, stockObject) => {
      console.log('detail:', detail);
      console.log('buyCondition:', buyCondition);
      console.log('체결데이터:', 체결데이터);
      console.log('stockObject:', stockObject);
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

      console.log('탭 :', activeTab);
      console.log('종목 :', detail.rsym);
      console.log('평가손익률 :', detail.evlu_pfls_rt);
      console.log('매수기준 :', buyCondition?.evluPflsRt);
      console.log('매수기준 설정값 :', detailSettings.buyRate);

      // 탭별 매수 조건
      switch (activeTab) {
        case '분석':
          // 분석 탭에서는 조건 없이 모든 종목 매수
          return true;

        case '구매':
          // 보유종목 탭에서는 설정된 매수기준 이하인 종목만 매수
          const evluPflsRt = buyCondition?.evluPflsRt;

          // 평가손익률이 매수기준 이하인 경우만 매수
          if (evluPflsRt !== undefined && evluPflsRt !== null) {
            // evlu_pfls_rt는 문자열 퍼센트 값으로 제공될 수 있으므로 숫자로 변환
            const profitRate =
              typeof evluPflsRt === 'string'
                ? parseFloat(evluPflsRt.replace('%', ''))
                : Number(evluPflsRt);

            console.log(`[${detail.rsym}] 평가손익률: ${profitRate}%`);
            console.log(`설정 매수기준: ${detailSettings.buyRate}%`);
            console.log(
              `매수 조건 충족: ${profitRate <= detailSettings.buyRate}%`
            );

            console.log(
              `${profitRate} < -5 && ${stockObject.예측결과} > 0.7 : ${
                profitRate < -5 && stockObject.예측결과 > 0.7
              }`
            );
            console.log(
              `${profitRate} < -10 && ${stockObject.예측결과} > 0.67 : ${
                profitRate < -10 && stockObject.예측결과 > 0.67
              }`
            );
            console.log(
              `${profitRate} < -15 && ${stockObject.예측결과} > 0.64 : ${
                profitRate < -15 && stockObject.예측결과 > 0.64
              }`
            );
            console.log(
              `${profitRate} < -20 && ${stockObject.예측결과} > 0.61 : ${
                profitRate < -20 && stockObject.예측결과 > 0.61
              }`
            );
            console.log(
              `${profitRate} < -25 && ${stockObject.예측결과} > 0.58 : ${
                profitRate < -25 && stockObject.예측결과 > 0.58
              }`
            );
            console.log(
              `${profitRate} < -30 && ${stockObject.예측결과} > 0.55 : ${
                profitRate < -30 && stockObject.예측결과 > 0.55
              }`
            );
            console.log(
              `${profitRate} < -35 && ${stockObject.예측결과} > 0.53 : ${
                profitRate < -35 && stockObject.예측결과 > 0.53
              }`
            );
            console.log(
              `${profitRate} < -40 && ${stockObject.예측결과} > 0.5 : ${
                profitRate < -40 && stockObject.예측결과 > 0.5
              }`
            );
            console.log(
              `${profitRate} < -45 && ${stockObject.예측결과} > 0.47 : ${
                profitRate < -45 && stockObject.예측결과 > 0.47
              }`
            );
            console.log(
              `${profitRate} < -50 && ${stockObject.예측결과} > 0.44 : ${
                profitRate < -50 && stockObject.예측결과 > 0.44
              }`
            );
            console.log(
              `${profitRate} < -55 && ${stockObject.예측결과} > 0.41 : ${
                profitRate < -55 && stockObject.예측결과 > 0.41
              }`
            );
            console.log(
              `${profitRate} < -60 && ${stockObject.예측결과} > 0.38 : ${
                profitRate < -60 && stockObject.예측결과 > 0.38
              }`
            );
            console.log(
              `${profitRate} < -65 && ${stockObject.예측결과} > 0.35 : ${
                profitRate < -65 && stockObject.예측결과 > 0.35
              }`
            );
            console.log(
              `${profitRate} < -70 && ${stockObject.예측결과} > 0.32 : ${
                profitRate < -70 && stockObject.예측결과 > 0.32
              }`
            );
            console.log(
              `${profitRate} < -75 && ${stockObject.예측결과} > 0.29 : ${
                profitRate < -75 && stockObject.예측결과 > 0.29
              }`
            );
            console.log(
              `${profitRate} < -80 && ${stockObject.예측결과} > 0.26 : ${
                profitRate < -80 && stockObject.예측결과 > 0.26
              }`
            );
            console.log(
              `${profitRate} < -85 && ${stockObject.예측결과} > 0.23 : ${
                profitRate < -85 && stockObject.예측결과 > 0.23
              }`
            );
            console.log(
              `${profitRate} < -90 && ${stockObject.예측결과} > 0.2 : ${
                profitRate < -90 && stockObject.예측결과 > 0.2
              }`
            );
            console.log(
              `${profitRate} < -95 && ${stockObject.예측결과} > 0.17 : ${
                profitRate < -95 && stockObject.예측결과 > 0.17
              }`
            );

            // 위 조건으로 변경
            return (
              (profitRate < -5 && stockObject.예측결과 > 0.7) ||
              (profitRate < -10 && stockObject.예측결과 > 0.67) ||
              (profitRate < -15 && stockObject.예측결과 > 0.64) ||
              (profitRate < -20 && stockObject.예측결과 > 0.61) ||
              (profitRate < -25 && stockObject.예측결과 > 0.58) ||
              (profitRate < -30 && stockObject.예측결과 > 0.55) ||
              (profitRate < -35 && stockObject.예측결과 > 0.53) ||
              (profitRate < -40 && stockObject.예측결과 > 0.5) ||
              (profitRate < -45 && stockObject.예측결과 > 0.47) ||
              (profitRate < -50 && stockObject.예측결과 > 0.44) ||
              (profitRate < -55 && stockObject.예측결과 > 0.41) ||
              (profitRate < -60 && stockObject.예측결과 > 0.38) ||
              (profitRate < -65 && stockObject.예측결과 > 0.35) ||
              (profitRate < -70 && stockObject.예측결과 > 0.32) ||
              (profitRate < -75 && stockObject.예측결과 > 0.29) ||
              (profitRate < -80 && stockObject.예측결과 > 0.26) ||
              (profitRate < -85 && stockObject.예측결과 > 0.23) ||
              (profitRate < -90 && stockObject.예측결과 > 0.2) ||
              (profitRate < -95 && stockObject.예측결과 > 0.17)
            );

            // 수정: 하드코딩된 -10 대신 설정값 사용
            return profitRate <= detailSettings.buyRate; // 설정값 이하 손실 중인 종목만 매수
          }

          return false;

        default:
          return false;
      }
    },
    [detailSettings]
  );

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
            `${cleanStockCode} 현재가: $${Number(detail.last)?.toFixed(2)}`
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
              const evluPflsRt = options.buyCondition?.evluPflsRt;
              options.onBuy(cleanStockCode, {
                ...detail,
                is분석: options.activeTab === '분석',
                perf_1_m: options.stockObject.perf_1_m,
                evluPflsRt:
                  typeof evluPflsRt === 'string'
                    ? parseFloat(evluPflsRt.replace('%', ''))
                    : Number(evluPflsRt),
              });
            }
          }

          // 매도 조건 확인 및 실행
          if (
            options.autoSell &&
            options.activeTab === '구매' &&
            options.stockObject &&
            options.onSell
          ) {
            // 매도 조건 체크 - 수정: 하드코딩된 2 대신 설정값 사용
            const profitRate = parseFloat(options.stockObject.evlu_pfls_rt); // 잔고인듯, 잔고의 손익률임
            const shouldSell =
              !isNaN(profitRate) && profitRate >= detailSettings.sellRate;

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

              // 매도 기준가
              const sellPrice = avgPrice * (1 + detailSettings.sellRate / 100);

              if (sellQuantity > 0) {
                // 이 부분 잘못됨
                //options.onSell(cleanStockCode, detail, sellQuantity, avgPrice);

                // 평균 매수가의 매도기준값보다 현재가가 높을 때 매도
                if (detail.last > sellPrice) {
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
    [현재가상세, detailSettings, shouldAutoBuy]
  );

  return {
    detailData,
    detailing: loading,
    error,
    fetchStockDetail,
  };
};

export default useStockDetail;

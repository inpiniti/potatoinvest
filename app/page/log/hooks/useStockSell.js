import { useState, useCallback, useEffect } from 'react';
import useTrading from '@/hooks/useTrading';
import { toast } from 'sonner';
import { settingStore } from '@/store/settingStore';

const useStockSell = () => {
  const [selling, setSelling] = useState(false);
  const { 매도 } = useTrading();

  // 추가: settingStore에서 설정값 가져오기
  const { setting } = settingStore();
  const [sellSettings, setSellSettings] = useState({
    sellRate: 2,
  });

  // 추가: 설정값 로드
  useEffect(() => {
    if (setting && setting.other) {
      setSellSettings({
        sellRate: setting.other.sellRate || 2,
      });
    }
  }, [setting]);

  // 종목 매도 함수
  const sellStock = useCallback(
    // 현재가도 받음
    async (stockCode, stockDetail, quantity, avgPrice, currentPrice) => {
      if (!stockCode) {
        toast.error('매도할 종목코드가 없습니다');
        return null;
      }

      // 종목코드 공백 제거
      const cleanStockCode = stockCode.trim();

      // 매도 수량 검증
      const sellQuantity = parseInt(quantity);
      if (isNaN(sellQuantity) || sellQuantity <= 0) {
        toast.error('유효하지 않은 매도 수량입니다');
        return null;
      }

      // 평균 매수가
      const purchasePrice = parseFloat(avgPrice);

      // 수정: 하드코딩된 1.02 대신 설정값 사용
      const sellRate = 1 + sellSettings.sellRate / 100;
      const sellPrice = (purchasePrice * sellRate)?.toFixed(2);

      setSelling(true);

      try {
        console.log('매도 정보:', {
          종목코드: cleanStockCode,
          매도수량: sellQuantity,
          매도가격: sellPrice,
          평균매수가: purchasePrice,
          현재가: currentPrice,
        });

        // 간소화된 매도 요청
        const response = await 매도({
          ovrs_pdno: cleanStockCode,
          ovrs_cblc_qty: String(sellQuantity),
          now_pric2: currentPrice,
        });

        if (response) {
          if (response.rt_cd === '0') {
            toast.success(
              `${cleanStockCode} ${sellQuantity}주 매도 주문 완료 ($${currentPrice})`
            );
          } else {
            toast.error(response.msg1 || '매도 주문 실패');
          }
        }

        return response;
      } catch (error) {
        console.error('매도 오류:', error);
        toast.error(`매도 실패: ${error.message || '알 수 없는 오류'}`);
        return null;
      } finally {
        setSelling(false);
      }
    },
    [매도, sellSettings] // 의존성 배열에 sellSettings 추가
  );

  // 특정 종목의 매도 가능 여부 확인
  const shouldSellStock = useCallback(
    (stockItem, 체결데이터) => {
      if (!stockItem) return false;

      // 종목코드 추출
      const stockCode =
        stockItem.name ||
        stockItem.code ||
        stockItem.ovrs_pdno ||
        stockItem.pdno;

      // 해당 종목이 체결 중인지 확인 (정확한 코드 매칭)
      const isPending = 체결데이터?.some((order) => {
        const orderCode = order.name || order.pdno;
        return orderCode === stockCode;
      });

      if (isPending) {
        console.log(`[${stockCode}] 체결 중이므로 매도 불가`);
        return false;
      }

      // 수익률 확인
      const profitRate = parseFloat(stockItem.evlu_pfls_rt);

      // 수정: 하드코딩된 2 대신 설정값 사용
      const shouldSell =
        !isNaN(profitRate) && profitRate >= sellSettings.sellRate;

      if (shouldSell) {
        console.log(
          `[${stockItem.ovrs_pdno}] 수익률 ${profitRate}% - 매도 조건 충족`
        );
      }

      return shouldSell;
    },
    [sellSettings]
  ); // sellSettings 의존성 추가

  return {
    selling,
    sellStock,
    shouldSellStock,
  };
};

export default useStockSell;

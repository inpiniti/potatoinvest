import { useState, useCallback } from "react";
import useTrading from "@/hooks/useTrading";
import { toast } from "sonner";

const useStockBuy = () => {
  const [buying, setBuying] = useState(false);
  const { 매수 } = useTrading();

  // 종목 매수 함수
  const buyStock = useCallback(
    async (stockCode, stockDetail) => {
      if (!stockCode || !stockDetail || !stockDetail.last) {
        toast.error("매수에 필요한 정보가 부족합니다");
        return null;
      }

      // 종목코드 공백 제거
      const cleanStockCode = stockCode.trim();

      // 현재가 추출 및 검증
      const currentPrice = parseFloat(stockDetail.last);
      if (isNaN(currentPrice) || currentPrice <= 0) {
        toast.error("유효하지 않은 종목 가격입니다");
        return null;
      }

      setBuying(true);

      try {
        // 현재가에서 2% 할인된 가격 계산
        //const discountPrice = Math.round(currentPrice * 0.98 * 100) / 100;
        // 할인 없이 현재가 그대로 사용
        const orderPrice = Math.round(currentPrice * 100) / 100;

        // 30만원어치 수량 계산 (환율 기본값 1500 사용)
        const exchangeRate = stockDetail.t_rate
          ? parseFloat(stockDetail.t_rate)
          : 1500;

        const dollarAmount = 300000 / exchangeRate;
        let quantity = Math.floor(dollarAmount / orderPrice);

        // 최소 1주 구매
        if (quantity < 1) quantity = 1;

        // 간소화된 매수 요청
        const response = await 매수({
          ovrs_pdno: cleanStockCode,
          now_pric2: String(orderPrice.toFixed(2)),
          ord_qty: String(quantity),
        });

        if (response) {
          if (response.rt_cd === "0") {
            toast.success(`${cleanStockCode} ${quantity}주 매수 주문 완료`);
          } else {
            toast.error(response.msg1 || "매수 주문 실패");
          }
        }

        return response;
      } catch (error) {
        console.error("매수 오류:", error);
        toast.error(`매수 실패: ${error.message || "알 수 없는 오류"}`);
        return null;
      } finally {
        setBuying(false);
      }
    },
    [매수]
  );

  // shouldBuyStock 함수 추가
  const shouldBuyStock = (stockItem, 체결데이터, activeTab) => {
    // 해당 종목이 체결 중인지 확인 (정확한 코드 매칭)
    const stockCode =
      stockItem.name || stockItem.code || stockItem.ovrs_pdno || stockItem.pdno;

    // 해당 종목이 체결 중인지 확인
    const isPending = 체결데이터?.some((order) => {
      const orderCode = order.name || order.pdno;
      return orderCode === stockCode;
    });

    if (isPending) {
      console.log(`[${stockCode}] 체결 중이므로 매수 불가`);
      return false;
    }

    // 탭에 따라 다른 매수 조건 적용
    if (activeTab === "분석") {
      // 분석 탭에서는 기본적으로 매수 가능
      return true;
    } else if (activeTab === "구매") {
      // 보유 종목에서는 수익률이 -10% 이하일 때만 매수
      const profitRate = parseFloat(stockItem.evlu_pfls_rt);

      // 손실률이 -5% 이하(더 작은)인 경우에만 매수
      const shouldBuy = !isNaN(profitRate) && profitRate <= -5;

      if (shouldBuy) {
        console.log(
          `[${
            stockItem.name || stockItem.ovrs_pdno
          }] 수익률 ${profitRate}% - 매수 조건 충족`
        );
      }

      return shouldBuy;
    }

    return false;
  };

  return {
    buying,
    buyStock,
    shouldBuyStock,
  };
};

export default useStockBuy;

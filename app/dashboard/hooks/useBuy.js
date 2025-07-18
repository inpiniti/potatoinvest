import useTrading from "@/hooks/useTrading";
import { toast } from "sonner";

const useBuy = () => {
  const { 매도 } = useTrading();
  const { 매수 } = useTrading();

  const mutation = async ({
    currentItem, // 현재 데이터
    priceDetailData, // 현재가 상세
    analysisItem, // 분석 데이터
    menu, // 현재 메뉴
    newsScore, // 뉴스분석 점수 (1-5)
    expertScore, // 전문가 분석 점수 (1-5)
    technicalScore, // 기술적 분석 점수 (1-5)
    financialScore, // 재무 분석 점수 (1-5로 변환)
  }) => {
    console.log("newsScore > 3", newsScore > 3);
    console.log("expertScore > 3", expertScore > 3);
    console.log("technicalScore > 3", technicalScore > 3);
    console.log("financialScore > 3", financialScore > 3);

    // 1. 메뉴가 잔고라면
    // 매입평균단가(currentItem.pchs_avg_pric)와
    // 현재가(priceDetailData.last) 비교

    // 2% 이상 차이가 나면 현재가에 매도가능
    // 매도가능수량(currentItem.ord_psbl_qty)
    // 보유수량(currentItem.ovrs_cblc_qty)
    // 종목코드(currentItem.ovrs_pdno)
    if (menu === "잔고") {
      // 현재가가 매입평균단가보다 2% 이상 높아야 매도 가능
      const purchasePrice = parseFloat(currentItem?.pchs_avg_pric);
      const currentPrice = parseFloat(priceDetailData?.last);
      const qty = currentItem?.ord_psbl_qty;
      const holdingQty = currentItem?.ovrs_cblc_qty;
      const code = currentItem?.ovrs_pdno;

      console.log("현재가격", currentPrice);
      console.log("매입평균단가", purchasePrice);
      console.log(
        "currentPrice > purchasePrice * 1.02",
        currentPrice > purchasePrice * 1.02
      );

      // 2% 이상 올라야 매도 가능
      if (currentPrice > purchasePrice * 1.02) {
        if (currentItem.isNotCnnl) {
          toast.error("미체결된 종목은 매도 할 수 없습니다.");
          return;
        }

        toast.success(
          `${code} ${qty}주 $${currentPrice.toFixed(2)}에 매도 주문중`
        );

        const response = await 매도({
          ovrs_pdno: code, // 종목코드
          ovrs_cblc_qty: String(qty), // 매도 수량
          now_pric2: currentPrice.toFixed(2), // 매도가
        });

        if (response?.rt_cd === "0") {
          toast.success(
            `${code} ${qty}주 $${currentPrice.toFixed(2)}에 매도 주문 완료`
          );
        } else {
          toast.error(response.msg1 || "매도 주문 실패");
        }
      } else {
        if (currentItem.isCnnl) {
          toast.error("체결된 종목은 추가매수 할 수 없습니다.");
          return;
        }
        // 매입평균단가(currentItem.pchs_avg_pric)와
        // 현재가(priceDetailData.last) 비교하여
        // 이익률(profitRate)을 계산하는데,

        // 이익율(profitRate)와
        // 예측결과(analysisItem.예측결과)를 조합해서
        // 조건을 만족하는 경우
        // toast 알림
        const profitRate =
          ((Number(currentPrice) - Number(purchasePrice)) /
            Number(purchasePrice)) *
          100;
        const predictionResult = Number(analysisItem?.예측결과);
        const shouldNotify =
          (profitRate < -5 && predictionResult > 0.7) ||
          (profitRate < -10 && predictionResult > 0.67) ||
          (profitRate < -15 && predictionResult > 0.64) ||
          (profitRate < -20 && predictionResult > 0.61) ||
          (profitRate < -25 && predictionResult > 0.58) ||
          (profitRate < -30 && predictionResult > 0.55) ||
          (profitRate < -35 && predictionResult > 0.53) ||
          (profitRate < -40 && predictionResult > 0.5) ||
          (profitRate < -45 && predictionResult > 0.47) ||
          (profitRate < -50 && predictionResult > 0.44) ||
          (profitRate < -55 && predictionResult > 0.41) ||
          (profitRate < -60 && predictionResult > 0.38) ||
          (profitRate < -65 && predictionResult > 0.35) ||
          (profitRate < -70 && predictionResult > 0.32) ||
          (profitRate < -75 && predictionResult > 0.29) ||
          (profitRate < -80 && predictionResult > 0.26) ||
          (profitRate < -85 && predictionResult > 0.23) ||
          (profitRate < -90 && predictionResult > 0.2) ||
          (profitRate < -95 && predictionResult > 0.17);

        if (
          shouldNotify &&
          newsScore > 3 &&
          expertScore > 3 &&
          technicalScore > 3 &&
          financialScore > 3
        ) {
          const response = await 매수({
            ovrs_pdno: code,
            now_pric2: currentPrice.toFixed(2),
            ord_qty: String(holdingQty),
          });
          if (response) {
            if (response.rt_cd === "0") {
              toast.success(
                `${code} ${holdingQty}주 $${currentPrice.toFixed(
                  2
                )}에 매수 주문 완료`
              );
            } else {
              toast.error(response.msg1 || "매수 주문 실패");
            }
          }
        }
      }
    } else if (menu === "분석") {
      // 보유 수량(currentItem.isHolding)이 아니면서, 체결수량(currentItem.isCnnl)도 아닌 경우
      // 현재가격(currentPrice)의
      // 한달간떨어진비율?(analysisItem.perf_1_m) * -1만원치
      // ex) perf_1_m(-1.3) * -1만원 = 13000원
      // 계산된수량(calculatedQty)
      // ex) 13000원 / (현재가격(1) * (환율)1500) = 내림(8.6주) = 8주

      if (
        !currentItem.isHolding &&
        !currentItem.isCnnl &&
        analysisItem?.perf_1_m &&
        newsScore > 3 &&
        expertScore > 3 &&
        technicalScore > 3 &&
        financialScore > 3
      ) {
        const currentPrice = parseFloat(priceDetailData?.last);
        const exchangeRate = 1500; // 환율 기본값
        const dollarAmount = (analysisItem.perf_1_m * -10000) / exchangeRate;
        let calculatedQty = Math.floor(dollarAmount / currentPrice);

        if (calculatedQty < 1) {
          toast.error(
            "계산된 수량이 1주 미만입니다. 매수 주문을 진행할 수 없습니다."
          );
        } else {
          // toast.success(
          //   `${currentItem.name} ${calculatedQty}주 $${currentPrice.toFixed(
          //     2
          //   )}에 매수 주문중`
          // );

          const response = await 매수({
            ovrs_pdno: currentItem.name, // 종목코드
            now_pric2: currentPrice.toFixed(2), // 현재가
            ord_qty: String(calculatedQty), // 수량
          });

          if (response?.rt_cd === "0") {
            toast.success(
              `${currentItem.name} ${calculatedQty}주 $${currentPrice.toFixed(
                2
              )}에 매수 주문 완료`
            );
          } else {
            toast.error(response.msg1 || "매수 주문 실패");
          }
        }
      }
    }
  };

  return {
    mutation,
  };
};

export default useBuy;

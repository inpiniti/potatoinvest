import useTrading from "@/hooks/useTrading";
import { toast } from "sonner";

const useBuy = () => {
  const { 매도 } = useTrading();
  const validate = () => {
    // 구매한 가격 보다 현재가격이 2% 큰지 체크
  };
  const mutation = async ({
    currentItem, // 현재 데이터
    priceDetailData, // 현재가 상세
    analysisItem, // 분석 데이터
    menu, // 현재 메뉴
  }) => {
    // 1. 메뉴가 잔고라면
    // 매입평균단가(currentItem.pchs_avg_pric)와
    // 현재가(priceDetailData.last) 비교

    // 2% 이상 차이가 나면 현재가에 매도가능
    // 보유수량(currentItem.ovrs_cblc_qty)
    // 종목코드(currentItem.ovrs_pdno)
    if (menu === "잔고") {
      // 현재가가 매입평균단가보다 2% 이상 높아야 매수 가능
      const purchasePrice = parseFloat(currentItem.pchs_avg_pric);
      const currentPrice = parseFloat(priceDetailData.last);
      const qty = currentItem.ovrs_cblc_qty;
      const code = currentItem.ovrs_pdno;

      // 2% 이상 차이가 나야 매도 가능
      if (currentPrice > purchasePrice * 1.02) {
        //
        // toast(
        //   `${code} ${qty}주 매도 가능 (${currentPrice} > ${
        //     purchasePrice * 1.02
        //   })`
        // );

        toast.success(`${code} ${qty}주 $${now_pric2}에 매도 주문중`);

        const response = await 매도({
          ovrs_pdno: code, // 종목코드
          ovrs_cblc_qty: String(qty), // 매도 수량
          now_pric2: currentPrice.toFixed(2), // 매도가
        });

        if (response?.rt_cd === "0") {
          toast.success(`${code} ${qty}주 $${now_pric2}에 매도 주문 완료`);
        } else {
          toast.error(response.msg1 || "매도 주문 실패");
        }
      } else {
        //toast("매수가능");
      }
    }
  };

  return {
    mutation,
  };
};

export default useBuy;

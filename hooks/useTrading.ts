import { delay } from "@/utils/util";
import useAccount from "./useAccount";
import useApi from "./useApi";

const useTrading = () => {
  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  // 주식잔고 확인
  const 주식잔고확인 = async () => {
    const payload = {
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: "NASD",
      TR_CRCY_CD: "USD",
      CTX_AREA_FK200: "",
      CTX_AREA_NK200: "",
    };

    const response = await api.trading.inquireBalance(payload);
    const data = await response.json();

    if (response.status !== 200) {
      console.error("주식잔고 확인 실패", response.status, data);
      return false;
    }

    if (data?.output1) return data?.output1;
    else return false;
  };

  const 매도 = async (item: Item) => {
    const payload = {
      tr: "매도",
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: "NASD",
      PDNO: item.ovrs_pdno,
      ORD_QTY: item.ovrs_cblc_qty,
      OVRS_ORD_UNPR: item.now_pric2,
    };

    const response = await api.trading.order(payload);
    const data = await response.json();

    if (response.status !== 200) {
      console.error("매도 실패", response.status, data);
      return false;
    }

    return data;
  };

  const 매수 = async (item: Item) => {
    const payload = {
      tr: "매수",
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: "NASD",
      PDNO: item.ovrs_pdno,
      ORD_QTY: item.ovrs_cblc_qty,
      OVRS_ORD_UNPR: item.now_pric2,
    };

    const response = await api.trading.order(payload);
    const data = await response.json();

    if (response.status !== 200) {
      console.error("매수 실패", response.status, data);
      return false;
    }

    return data;
  };

  interface Item {
    evlu_pfls_rt: string; // 평가손익률
    ovrs_pdno: string; // 해외종목코드
    ovrs_cblc_qty: string; // 해외주문수량
    now_pric2: string; // 해외주문단가
  }

  const 매도확인 = async (item: Item) => {
    await delay(500);
    return Number(item.evlu_pfls_rt) > 2;
  };

  const 물타기확인 = async (item: Item) => {
    await delay(500);
    return Number(item.evlu_pfls_rt) < -2;
  };

  const 조건검색 = async (종목코드: string) => {
    const response = await api.quotations.inquireSearch({
      EXCD: "NAS",
    });
    const list = await response.json();

    const newData = list?.output2?.find(
      (item: { symb: string }) => item?.symb === 종목코드
    );

    return newData;
  };

  return { 주식잔고확인, 매도확인, 물타기확인, 매도, 매수, 조건검색 };
};

export default useTrading;

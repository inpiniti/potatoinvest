import { delay } from "@/utils/util";
import useAccount from "./useAccount";
import useApi from "./useApi";
import { settingStore } from "@/store/settingStore";

const useTrading = () => {
  const api = useApi();
  const { setting } = settingStore();
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

    let allOutput1: unknown[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await api.trading.inquireBalance(payload);
      const data = await response.json();

      if (response.status !== 200) {
        console.error("주식잔고 확인 실패", response.status, data);
        return false;
      }

      if (data?.output1) {
        allOutput1 = [...allOutput1, ...data.output1];
      }

      if (
        data?.ctx_area_nk200?.trim() !== "" ||
        data?.ctx_area_fk200?.trim() !== ""
      ) {
        // 다음 페이지가 있는 경우, 페이로드를 업데이트
        payload.CTX_AREA_NK200 = data?.ctx_area_nk200?.trim() ?? "";
        payload.CTX_AREA_FK200 = data?.ctx_area_fk200?.trim() ?? "";
      } else {
        // 다음 페이지가 없으면 반복 종료
        hasNextPage = false;
      }
    }

    return allOutput1;
  };

  // 미체결내역
  const 미체결내역 = async () => {
    const payload = {
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: "NASD",
      SORT_SQN: "DS",
      CTX_AREA_FK200: "",
      CTX_AREA_NK200: "",
    };

    const response = await api.trading.inquireNccs(payload);
    const data = await response.json();

    if (response.status !== 200) {
      console.error("미체결내역 실패", response.status, data);
      return false;
    }

    return data;
  };

  const 매도 = async (item: Item) => {
    const payload = {
      tr: "매도",
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD: "NASD",
      PDNO: item.ovrs_pdno,
      ORD_QTY: item.ovrs_cblc_qty,
      OVRS_ORD_UNPR: (Math.round(Number(item.now_pric2) * 100) / 100).toFixed(
        2
      ),
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
      ORD_QTY: "1",
      OVRS_ORD_UNPR: (
        (Math.round(Number(item.now_pric2) * 100) / 100) *
        0.98
      ).toFixed(2),
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
    예측결과: number; // 예측결과
    매도기준치: number; // 매도기준치
    물타기기준치: number; // 물타기기준치
  }

  const 매도확인 = async (item: Item) => {
    await delay(500);
    return (
      Number(item.evlu_pfls_rt) > setting.other.sellRate &&
      item?.예측결과 < item?.매도기준치
    );
  };

  const 물타기확인 = async (item: Item) => {
    await delay(500);
    return (
      Number(item.evlu_pfls_rt) < setting.other.buyRate &&
      item?.예측결과 > item?.물타기기준치
    );
  };

  return { 주식잔고확인, 매도확인, 물타기확인, 미체결내역, 매도, 매수 };
};

export default useTrading;

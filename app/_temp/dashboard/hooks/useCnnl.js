import { useQuery } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import dayjs from "dayjs";
import useAccount from "@/hooks/useAccount";
import { keyStore } from "@/store/keyStore";
import { useState } from "react";

const useCnnl = (refetchInterval = 1000 * 60) => {
  const { key } = keyStore();
  const { appKey, secretKey } = key;
  const [error, setError] = useState(null);

  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  const fetchCnnlData = async () => {
    try {
      // API 키가 없으면 작업 중단
      if (!appKey || !secretKey) {
        throw new Error(
          "API 키가 설정되지 않았습니다. 계정 설정을 확인해주세요."
        );
      }

      // 계좌 정보가 없으면 작업 중단
      if (!CANO || !ACNT_PRDT_CD) {
        throw new Error("계좌 정보가 없습니다. 계정 설정을 확인해주세요.");
      }

      let allData = [];
      let hasMore = true;
      let ctxAreaNk200 = "";
      let ctxAreaFk200 = "";

      while (hasMore) {
        const payload = {
          CANO,
          ACNT_PRDT_CD,
          OVRS_EXCG_CD: "NASD", // 해외거래소코드 (기본값: 'NASD' - 미국전체)
          PDNO: "%", // 상품번호 (전종목 : '%')
          ORD_STRT_DT: dayjs().format("YYYYMMDD"), // 주문시작일 (YYYYMMDD)
          ORD_END_DT: dayjs().format("YYYYMMDD"), // 주문종료일 (YYYYMMDD)
          SLL_BUY_DVSN: "00", // 매도매수구분 (전체: '00', 매수 : '01', 매도 : '02')
          CCLD_NCCS_DVSN: "00", // 취소미체결구분 (전체: '00', 취소 : '01', 미체결 : '02')
          SORT_SQN: "DS", // 정렬순서 ('DS' : 정순, 'AS': 역순)
          ORD_DT: "", // 주문일자 (YYYYMMDD)
          ORD_GNO_BRNO: "", // 주문채번지점번호
          ODNO: "", // 주문번호
          CTX_AREA_NK200: ctxAreaNk200, // 연속조회키200
          CTX_AREA_FK200: ctxAreaFk200, // 연속조회검색조건200
        };

        let response;
        let data;
        let retryCount = 0;

        // fetch 실패 시 최대 3회 재시도
        while (retryCount < 3) {
          response = await api.trading.inquireCcnl(payload);
          try {
            data = await response.json();
          } catch {
            data = {};
          }
          if (data && data.message === "fetch failed") {
            retryCount++;
            await new Promise((res) => setTimeout(res, 1000 * retryCount)); // 점점 대기시간 증가
            continue;
          }
          break;
        }

        if (!response.ok) {
          throw new Error(`API 오류: ${response.status}`);
        }

        if (data?.output?.length > 0) {
          allData = [...allData, ...data.output];

          // 연속 조회 키가 있으면 다음 페이지로
          if (data.ctx_area_nk200 && data.ctx_area_nk200.trim() !== "") {
            ctxAreaNk200 = data.ctx_area_nk200;
            ctxAreaFk200 = data.ctx_area_fk200;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      return allData;
    } catch (error) {
      console.error("CNNL 데이터 로드 실패:", error);
      setError(error.message);
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ["cnnData"],
    queryFn: fetchCnnlData,
    refetchInterval,
    refetchIntervalInBackground: true,
    staleTime: refetchInterval - 10000,
    enabled: !!appKey && !!secretKey && !!CANO && !!ACNT_PRDT_CD, // API 키와 계좌 정보가 있을 때만 실행
    retry: 1, // 실패 시 한 번만 재시도
    onError: (error) => {
      console.error("CNNL 데이터 쿼리 오류:", error);
      setError(error.message);
    },
  });

  return {
    ...query,
    error: query.error?.message || error,
  };
};

export default useCnnl;

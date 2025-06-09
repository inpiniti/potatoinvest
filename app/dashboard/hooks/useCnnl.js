import { useQuery } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import dayjs from "dayjs";
import useAccount from "@/hooks/useAccount";
import { keyStore } from "@/store/keyStore";

const useCnnl = (refetchInterval = 1000 * 60) => {
  const { key } = keyStore();
  const { appKey, secretKey } = key;

  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  const fetchCnnlData = async () => {
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
      CTX_AREA_NK200: "", // 연속조회키200
      CTX_AREA_FK200: "", // 연속조회검색조건200
    };

    const response = await api.trading.inquireCcnl(payload);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.output || [];
  };

  const query = useQuery({
    queryKey: ["cnnData"],
    queryFn: fetchCnnlData,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: refetchInterval - 10000,
    enabled: !!appKey && !!secretKey, // appKey와 secretKey가 존재할 때만 실행
    onError: (error) => {
      console.error("CNN 데이터 쿼리 오류:", error);
      setError(error.message);
    },
  });

  return query;
};

export default useCnnl;

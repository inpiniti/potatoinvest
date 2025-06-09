import { useQuery } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";
import { keyStore } from "@/store/keyStore";

const useProfit = (refetchInterval = 1000 * 60) => {
  const { key } = keyStore();
  const { appKey, secretKey } = key;

  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  const fetchProfitData = async () => {
    const payload = {
      CANO,
      ACNT_PRDT_CD,
      OVRS_EXCG_CD,
      NATN_CD, // 국가코드 : 공란
      CRCY_CD, // 통화코드 : 공란
      PDNO, // 상품번호 : 공란
      INQR_STRT_DT, // 조회시작일자
      INQR_END_DT, // 조회종료일자
      WCRC_FRCR_DVSN_CD, // 원화외화구분코드 : 01: 외화, 02: 원화
      CTX_AREA_FK200, // 연속조회검색조건200 : 공란
      CTX_AREA_NK200, // 연속조회키200 : 공란
    };

    const response = await api.trading.inquirePeriodProfit(payload);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.output || [];
  };

  const query = useQuery({
    queryKey: ["profitData"],
    queryFn: fetchProfitData,
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

export default useProfit;

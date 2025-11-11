import { useMutation } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";

const useDailyprice = () => {
  const api = useApi();

  // PDNO, PRDT_TYPE_CD를 파라미터로 받음
  const fetchDailyPrice = async ({
    AUTH = "", // 사용자권한정보
    EXCD = "NAS", // 거래소코드
    SYMB = "TSLA", // 종목코드 (PDNO)
    GUBN = "0", // 구분 (0: 일, 1: 주, 2: 월)
    BYMD = "", // 기준일자 (YYYYMMDD)
    MODP = "0", // 수정주가반영여부 (0: 미반영, 1: 반영)
  }) => {
    const payload = {
      AUTH,
      excd: EXCD,
      symb: SYMB,
      gubn: GUBN,
      BYMD,
      modp: MODP,
    };

    const response = await api.quotations.dailyprice(payload);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.output2 || {};
  };

  // useMutation 사용, 사용자가 직접 호출
  const mutation = useMutation({
    mutationFn: fetchDailyPrice,
    onError: (error) => {
      console.error("검색 정보 쿼리 오류:", error);
    },
  });

  return mutation;
};

export default useDailyprice;

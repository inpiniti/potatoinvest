import { useMutation } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";

const usePriceDetail = () => {
  const api = useApi();

  const fetchPriceDetail = async ({
    EXCD = "NAS", // 거래소코드
    SYMB = "TSLA", // 종목코드 (PDNO)
  }) => {
    const payload = {
      EXCD: EXCD,
      SYMB: SYMB,
    };

    const response = await api.quotations.priceDetail(payload);

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.output || {};
  };

  // useMutation 사용, 사용자가 직접 호출
  const mutation = useMutation({
    mutationFn: fetchPriceDetail,
    onError: (error) => {
      console.error("현제가 상세 쿼리 오류:", error);
    },
  });

  return mutation;
};

export default usePriceDetail;

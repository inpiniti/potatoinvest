import { useState, useCallback } from "react";
import useQuotations from "@/hooks/useQuotations";
import { toast } from "sonner";

const useStockDetail = () => {
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { 현재가상세 } = useQuotations();

  // 종목 상세 정보 조회 함수
  const fetchStockDetail = useCallback(
    async (stockCode) => {
      if (!stockCode) {
        toast.error("종목코드가 없습니다");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        toast.info(`${stockCode} 종목 현재가 조회 중...`);
        const detail = await 현재가상세(stockCode);
        setDetailData(detail);

        if (detail) {
          toast.success(
            `${stockCode} 현재가: $${Number(detail.last).toFixed(2)}`
          );
        } else {
          toast.warning(`${stockCode} 현재가 조회 결과 없음`);
        }

        return detail;
      } catch (error) {
        console.error("종목 상세 정보 조회 실패:", error);
        setError("종목 상세 정보를 가져오는데 실패했습니다.");
        toast.error(`${stockCode} 현재가 조회 실패`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [현재가상세]
  );

  return {
    detailData,
    loading,
    error,
    fetchStockDetail,
  };
};

export default useStockDetail;

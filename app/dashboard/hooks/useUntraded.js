import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUntradedStore } from "@/store/useUntradedStore";
import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";

/**
 * 미체결 주문 데이터를 관리하는 훅
 * @param {number} refetchInterval - 데이터 갱신 주기 (밀리초)
 */
const useUntraded = (refetchInterval = 1000 * 60) => {
  // 기본값 1분
  const { untradedData, setUntradedData } = useUntradedStore();
  const [error, setError] = useState(null);
  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  // 미체결 내역 가져오기
  const fetchUntradedData = async () => {
    try {
      if (!CANO || !ACNT_PRDT_CD) {
        throw new Error("계좌 정보가 없습니다. 계정 설정을 확인해주세요.");
      }

      // 미체결 내역 조회 API 호출
      const response = await api.trading.inquireNccs({
        CANO,
        ACNT_PRDT_CD,
        // 필요한 추가 파라미터 설정
      });

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();

      // 미체결 데이터 처리
      const processedData = (data.output || []).map((item) => ({
        ...item,
        type: "체결",
        name: item.pdno || item.name,
        // 필요한 필드 변환 및 추가
        orderDate: item.ord_dt || new Date().toISOString(),
        orderType: item.ord_tp_nm || "미체결",
        orderPrice: parseFloat(item.ord_prcs || 0),
        orderQuantity: parseInt(item.ord_qty || 0),
        untradedQuantity: parseInt(item.navl_qty || 0),
        orderStatus: item.ord_stat_nm || "접수",
        marketType: item.excg_cd || "KRX",
        lastUpdated: new Date().toISOString(),
      }));

      // 정렬: 주문 시간 기준 내림차순
      processedData.sort((a, b) => {
        return new Date(b.orderDate) - new Date(a.orderDate);
      });

      // 스토어에 데이터 저장
      setUntradedData(processedData);
      return processedData;
    } catch (error) {
      console.error("미체결 데이터 로드 실패:", error);
      setError(error.message);
      // 기존 데이터 반환 (오류 시 이전 데이터 유지)
      return untradedData;
    }
  };

  // React Query 사용해서 자동 갱신
  const query = useQuery({
    queryKey: ["untradedData"],
    queryFn: fetchUntradedData,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: refetchInterval - 10000,
    onError: (error) => {
      console.error("미체결 데이터 쿼리 오류:", error);
      setError(error.message);
    },
  });

  // 수동으로 새로고침하는 함수
  const refreshData = () => {
    query.refetch();
  };

  return {
    untradedData: query.data || untradedData,
    isLoading: query.isLoading,
    isError: query.isError || !!error,
    error: query.error?.message || error,
    refetch: refreshData,
    isFetching: query.isFetching,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    setRefetchInterval: (newInterval) => {
      query.setOptions({ refetchInterval: newInterval });
    },
  };
};

export default useUntraded;

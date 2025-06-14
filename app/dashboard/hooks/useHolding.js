import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";
import { keyStore } from "@/store/keyStore";

/**
 * 보유 종목 데이터를 관리하는 훅
 * @param {number} refetchInterval - 데이터 갱신 주기 (밀리초)
 */
const useHolding = (refetchInterval = 1000 * 60) => {
  const { key } = keyStore();
  const { appKey, secretKey } = key;

  // 기본값 1분
  //const { holdingData, setHoldingData } = useHoldingStore();
  const [error, setError] = useState(null);
  const api = useApi();
  const [CANO, ACNT_PRDT_CD] = useAccount();

  // 보유 종목 데이터 가져오기
  const fetchHoldingData = async () => {
    try {
      if (!CANO || !ACNT_PRDT_CD) {
        throw new Error("계좌 정보가 없습니다. 계정 설정을 확인해주세요.");
      }

      const payload = {
        CANO,
        ACNT_PRDT_CD,
        OVRS_EXCG_CD: "NASD", // 나스닥 기본값
        TR_CRCY_CD: "USD", // 달러 기본값
        CTX_AREA_FK200: "",
        CTX_AREA_NK200: "",
      };

      // 보유 종목 잔고 조회 API 호출
      const response = await api.trading.inquireBalance(payload);

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();

      // 보유 종목 데이터 처리
      let processedData = (data.output1 || []).map((item) => ({
        ...item,
        type: "구매",
        // 기본 필드 매핑 및 추가
        name: item.ovrs_pdno || item.name,
        symbol: item.ovrs_pdno,
        quantity: parseInt(item.ovrs_cblc_qty || 0),
        averageCost: parseFloat(item.pchs_avg_pric || 0),
        currentPrice: parseFloat(item.last_prpr || 0),
        marketValue: parseFloat(item.ovrs_stck_evlu_amt || 0),
        profitLoss: parseFloat(item.evlu_pfls_amt || 0),
        profitLossRate: parseFloat(item.evlu_pfls_rt || 0) / 100, // % → 소수점
        currency: item.tr_crcy_cd || "USD",
        marketType: item.ovrs_excg_cd || "NASD",
        lastUpdated: new Date().toISOString(),
      }));

      // 수익률 기준 정렬 (낮은 순)
      processedData = processedData.sort((a, b) => {
        return a.profitLossRate - b.profitLossRate;
      });

      // 스토어에 데이터 저장
      //setHoldingData(processedData);
      return {
        holdingData: processedData,
        output2: data.output2 || {},
      };
    } catch (error) {
      console.error("보유 종목 데이터 로드 실패:", error);
      setError(error.message);
      // 기존 데이터 반환 (오류 시 이전 데이터 유지)
      return {
        holdingData: [],
        output2: {},
      };
    }
  };

  // React Query 사용해서 자동 갱신
  const query = useQuery({
    queryKey: ["holdingData"],
    queryFn: fetchHoldingData,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: refetchInterval - 10000,
    enabled: !!appKey && !!secretKey, // appKey와 secretKey가 존재할 때만 실행
    onError: (error) => {
      console.error("보유 종목 데이터 쿼리 오류:", error);
      setError(error.message);
    },
  });

  // 수동으로 새로고침하는 함수
  const refreshData = () => {
    query.refetch();
  };

  // 분석 데이터와 결합하는 기능 추가
  const joinWithAnalysisData = (analysisData) => {
    if (!query.data || !analysisData) return query.data;

    return query.data.map((item) => {
      // 분석 데이터에서 매칭되는 항목 찾기
      const matchingAnalysis = analysisData.find(
        (analysis) =>
          analysis.name === item.name || analysis.code === item.symbol
      );

      return {
        ...item,
        // 예측결과가 있으면 사용, 없으면 기존 수익률 사용
        예측결과: matchingAnalysis
          ? matchingAnalysis.예측결과
          : item.profitLossRate,
        // 분석 데이터의 추가 필드 병합
        ...(matchingAnalysis || {}),
      };
    });
  };

  return {
    balanceData: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError || !!error,
    error: query.error?.message || error,
    refetch: refreshData,
    isFetching: query.isFetching,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    setRefetchInterval: (newInterval) => {
      query.setOptions({ refetchInterval: newInterval });
    },
    joinWithAnalysisData, // 분석 데이터와 결합하는 헬퍼 함수
  };
};

export default useHolding;

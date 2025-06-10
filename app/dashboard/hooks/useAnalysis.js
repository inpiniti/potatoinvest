import { useState, useEffect, useRef } from "react";
import aiModels from "@/json/ai_models.json";
import { useQuery } from "@tanstack/react-query";

// 웹 워커를 사용하는 분석 기능 훅
const useAnalysis = (refetchInterval = 1000 * 60 * 2) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [workerReady, setWorkerReady] = useState(false);

  // Worker 참조 저장
  const workerRef = useRef(null);
  const messageHandlerRef = useRef(null);

  // Worker 초기화
  useEffect(() => {
    if (typeof window === "undefined") return; // 서버 사이드 렌더링 방지
    if (workerRef.current) return; // 이미 Worker가 생성된 경우 방지

    try {
      if (typeof window.Worker === "function") {
        const worker = new window.Worker("/workers/analysis.worker.js");
        workerRef.current = worker;

        const handleMessage = (e) => {
          const { type, payload } = e.data;

          switch (type) {
            case "WORKER_READY":
              setWorkerReady(true);
              console.log("분석 워커가 준비되었습니다.");
              break;

            case "PROCESS_COMPLETE":
              console.log(`분석 처리 완료: ${payload.length}개 항목`);
              setIsProcessing(false);
              break;

            case "ERROR":
              console.error("워커 처리 오류:", payload);
              setError(payload);
              setIsProcessing(false);
              break;

            default:
              console.warn("알 수 없는 워커 메시지:", e.data);
          }
        };

        messageHandlerRef.current = handleMessage;
        worker.addEventListener("message", handleMessage);

        return () => {
          if (workerRef.current) {
            worker.removeEventListener("message", handleMessage);
            worker.terminate();
            workerRef.current = null;
          }
        };
      } else {
        throw new Error("이 브라우저는 Web Worker를 지원하지 않습니다.");
      }
    } catch (error) {
      console.error("웹 워커 초기화 오류:", error);
      setError(`웹 워커를 초기화할 수 없습니다: ${error.message}`);
    }
  }, []);

  // 메인 데이터 가져오기 함수
  const fetchData = async () => {
    try {
      const response = await fetch("/api/hello");

      if (!response.ok) {
        throw new Error(
          `API 응답 오류: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      setError(`데이터 가져오기 실패: ${error.message}`);
      throw error;
    }
  };

  // 분석 데이터 가져오기 함수
  const getAnalysisData = async () => {
    if (!workerRef.current || !workerReady) {
      setError(
        "웹 워커가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요."
      );
      return [];
    }

    try {
      setIsProcessing(true);
      setError(null);

      const rawData = await fetchData();

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error("유효한 데이터를 가져오지 못했습니다.");
      }

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("데이터 처리 시간이 초과되었습니다."));
        }, 30000);

        const responseHandler = (e) => {
          const { type, payload } = e.data;

          if (type === "PROCESS_COMPLETE") {
            clearTimeout(timeoutId);
            workerRef.current.removeEventListener("message", responseHandler);
            resolve(payload);
          } else if (type === "ERROR") {
            clearTimeout(timeoutId);
            workerRef.current.removeEventListener("message", responseHandler);
            reject(new Error(payload));
          }
        };

        workerRef.current.addEventListener("message", responseHandler);

        workerRef.current.postMessage({
          type: "PROCESS_DATA",
          payload: {
            rawData,
            aiModels: aiModels.ai_models || [],
          },
        });
      });
    } catch (error) {
      setIsProcessing(false);
      setError(`분석 처리 중 오류: ${error.message}`);
      console.error("분석 오류:", error);
      return [];
    }
  };

  // React Query 사용
  const query = useQuery({
    queryKey: ["analysisData"],
    queryFn: getAnalysisData,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: refetchInterval - 10000,
    enabled: workerReady,
    onError: (error) => {
      console.error("쿼리 에러:", error);
    },
  });

  // 수동으로 새로고침하는 함수
  const refreshData = () => {
    if (!workerReady) {
      setError("웹 워커가 준비되지 않았습니다.");
      return;
    }
    query.refetch();
  };

  return {
    analysisData: query.data || [],
    isLoading: query.isLoading || isProcessing,
    isError: query.isError || !!error,
    error: query.error?.message || error,
    refetch: refreshData,
    isFetching: query.isFetching,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    setRefetchInterval: (newInterval) => {
      query.setOptions({ refetchInterval: newInterval });
    },
    workerReady,
  };
};

export default useAnalysis;

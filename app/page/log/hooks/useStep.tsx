import { useState } from "react";
import { StepStatus } from "../types";

/**
 * 개별 스텝의 상태 관리를 위한 훅
 * 스텝 컴포넌트 내부에서 사용됩니다.
 */
export function useStep(initialStatus: StepStatus = "pending") {
  const [status, setStatus] = useState<StepStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // 상태 설정 함수들
  const setPending = () => setStatus("pending");
  const setProcessing = () => {
    setStatus("processing");
    setIsLoading(true);
  };
  const setCompleted = () => {
    setStatus("completed");
    setIsLoading(false);
  };
  const setFailed = () => {
    setStatus("failed");
    setIsLoading(false);
  };
  const setWaiting = () => {
    setStatus("waiting");
    setIsLoading(false);
  };

  return {
    status,
    isLoading,
    isPending: status === "pending",
    isProcessing: status === "processing",
    isCompleted: status === "completed",
    isFailed: status === "failed",
    isWaiting: status === "waiting",
    setPending,
    setProcessing,
    setCompleted,
    setFailed,
    setWaiting,
  };
}

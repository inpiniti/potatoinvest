import { useState, useRef, useEffect } from "react";
import { LogData, LogType } from "./logComponentFactory";

// 전체 프로세스 상태 정의
type ProcessState = "idle" | "running" | "stopped";

// 스텝 상태 정의
type StepState =
  | "pending"
  | "processing"
  | "completed"
  | "waiting_confirmation";

// API 호출 모의 함수
const mockApiCall = async (type: string, data: any): Promise<any> => {
  console.log(`API 호출: ${type}`, data);
  const delay = Math.floor(Math.random() * 1500) + 500;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: `${type} 처리 완료`, data });
    }, delay);
  });
};

export function useLog() {
  // 로그 항목 상태
  const [log, setLog] = useState<LogData[]>([]);

  // 전체 프로세스 상태
  const [processState, setProcessState] = useState<ProcessState>("idle");

  // 현재 스텝 상태
  const [currentStepState, setCurrentStepState] =
    useState<StepState>("pending");

  // 참조 변수들
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counterRef = useRef(0);
  const idCounterRef = useRef(0);
  const currentStepIdRef = useRef<string | null>(null);

  // 로그 컴포넌트 순서 정의
  const logSequence: LogType[] = ["text", "warning", "success"];

  useEffect(() => {
    // 컴포넌트 언마운트 시 정리
    return () => cleanupResources();
  }, []);

  // 모든 리소스 정리 함수
  const cleanupResources = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 고유 ID 생성 함수
  const generateUniqueId = () => {
    const timestamp = new Date().getTime();
    idCounterRef.current += 1;
    return `log-${timestamp}-${idCounterRef.current}`;
  };

  // 로그 상태 업데이트 함수들
  const updateLogStatus = (id: string, updates: Partial<LogData>) => {
    setLog((prevLog) =>
      prevLog.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // 로그 항목 추가
  const addLogItem = (content: string, type: LogType = "text") => {
    const now = new Date();
    const formattedDate = now.toLocaleTimeString();
    const id = generateUniqueId();

    const newLogItem: LogData = {
      id,
      type,
      date: formattedDate,
      content,
      loading: false,
      confirmed: false,
      processed: false,
    };

    // 로그 목록 맨 앞에 추가
    setLog((prevLog) => [newLogItem, ...prevLog]);

    // 텍스트 타입인 경우 확인 필요
    if (type === "text") {
      currentStepIdRef.current = id;
      setCurrentStepState("waiting_confirmation");
    } else {
      // 다른 타입은 자동으로 처리
      currentStepIdRef.current = id;
      processApiForStep(id, type, content);
    }

    return id;
  };

  // 스텝의 API 처리
  const processApiForStep = async (
    id: string,
    type: LogType,
    content: string
  ) => {
    // 이미 중지된 경우 처리하지 않음
    if (processState === "stopped") return;

    // 로딩 상태로 업데이트
    updateLogStatus(id, { loading: true });
    setCurrentStepState("processing");

    try {
      // API 호출
      await mockApiCall(type, { content });

      // 중간에 중지됐는지 확인
      if (processState === "stopped") return;

      // 처리 완료 상태로 업데이트
      updateLogStatus(id, { loading: false, processed: true });
      setCurrentStepState("completed");

      // 다음 스텝 처리
      if (processState === "running") {
        scheduleNextStep();
      }
    } catch (error) {
      console.error("API 호출 실패:", error);
      updateLogStatus(id, { loading: false });

      // 중간에 중지됐는지 확인
      if (processState === "stopped") return;

      // 실패해도 다음으로 진행
      setCurrentStepState("completed");
      if (processState === "running") {
        scheduleNextStep();
      }
    }
  };

  // 사용자 확인 처리
  const handleConfirm = async (id: string) => {
    // 중지 상태이거나 다른 ID인 경우 무시
    if (processState === "stopped" || currentStepIdRef.current !== id) {
      return;
    }

    // 해당 로그 찾기
    const logItem = log.find((item) => item.id === id);
    if (!logItem) return;

    // 로딩 상태 설정
    updateLogStatus(id, { loading: true });
    setCurrentStepState("processing");

    try {
      // API 호출
      await mockApiCall("confirm", { content: logItem.content });

      // 중간에 중지됐는지 확인
      if (processState === "stopped") return;

      // 처리 완료 상태로 업데이트
      updateLogStatus(id, { loading: false, confirmed: true, processed: true });
      setCurrentStepState("completed");

      // 다음 스텝 처리
      if (processState === "running") {
        scheduleNextStep();
      }
    } catch (error) {
      console.error("확인 API 호출 실패:", error);

      // 중간에 중지됐는지 확인
      if (processState === "stopped") return;

      updateLogStatus(id, { loading: false });
      setCurrentStepState("completed");

      // 실패해도 다음 스텝 처리
      if (processState === "running") {
        scheduleNextStep();
      }
    }
  };

  // 다음 스텝 스케줄링
  const scheduleNextStep = () => {
    // 이미 타이머가 있거나 중지 상태면 처리하지 않음
    if (timerRef.current || processState !== "running") return;

    // 약간의 지연시간을 두고 다음 스텝 처리
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      // 중간에 중지됐는지 다시 확인
      if (processState === "running") {
        processNextStep();
      }
    }, 500) as unknown as ReturnType<typeof setInterval>;
  };

  // 다음 스텝 처리
  const processNextStep = () => {
    // 중지 상태면 처리하지 않음
    if (processState !== "running") return;

    // 스텝 카운터 증가
    counterRef.current += 1;

    // 순환적으로 다른 타입의 로그 생성
    const stepType = logSequence[counterRef.current % logSequence.length];

    // 로그 타입에 따라 다른 컨텐츠 생성
    let content = "";
    switch (stepType) {
      case "text":
        content = `정보: 스텝 ${counterRef.current} 실행 중`;
        break;
      case "warning":
        content = `주의: 변동성이 감지되었습니다 (${counterRef.current})`;
        break;
      case "success":
        content = `성공: 작업 ${counterRef.current} 완료`;
        break;
    }

    // 스텝용 로그 추가
    addLogItem(content, stepType);

    // 일정 스텝 이상 진행되면 자동 중지 (옵션)
    if (counterRef.current >= 20) {
      stopLogging();
    }
  };

  // 로깅 시작
  const startLogging = () => {
    // 상태 초기화
    counterRef.current = 0;
    currentStepIdRef.current = null;

    // 프로세스 상태 업데이트
    setProcessState("running");
    setCurrentStepState("pending");

    // 기존 타이머 정리
    cleanupResources();

    // 시작 로그 추가
    addLogItem("자동 매매를 시작합니다", "text");
  };

  // 로깅 중지
  const stopLogging = () => {
    // 타이머 정리
    cleanupResources();

    // 프로세스 상태 업데이트
    setProcessState("stopped");
    setCurrentStepState("pending");

    // 현재 진행 중인 스텝이 있다면 로딩 상태 제거
    if (currentStepIdRef.current) {
      updateLogStatus(currentStepIdRef.current, { loading: false });
    }

    // 중지 메시지 추가
    addLogItem("자동 매매가 중지되었습니다", "warning");
  };

  return {
    log,
    processState,
    currentStepState,
    addLogItem,
    startLogging,
    stopLogging,
    handleConfirm,
  };
}

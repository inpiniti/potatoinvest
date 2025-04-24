import { useState, useRef, useEffect } from "react";
import { Step, StepId, StepResult, StepStatus, WorkflowStatus } from "../types";
import { stepConfigs, initialStepId } from "../config/steps";

/**
 * 워크플로우 관리 훅
 * 스텝의 생성, 실행, 상태 관리를 담당합니다.
 */
export function useWorkflow() {
  // 스텝 목록 상태
  const [steps, setSteps] = useState<Step[]>([]);

  // 워크플로우 상태
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>("idle");

  // 현재 실행 중인 스텝 ID 참조
  const currentStepIdRef = useRef<string | null>(null);

  // 고유 ID 카운터
  const idCounterRef = useRef(0);

  // 워크플로우 상태가 변경될 때마다 로깅
  useEffect(() => {
    console.log(`워크플로우 상태 변경: ${workflowStatus}`);
  }, [workflowStatus]);

  // 고유 ID 생성 함수
  const generateUniqueId = () => {
    const timestamp = new Date().getTime();
    idCounterRef.current += 1;
    return `step-${timestamp}-${idCounterRef.current}`;
  };

  // 타임스탬프 포맷 함수
  const formatTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  // 스텝 생성 함수
  const createStep = (stepId: StepId): Step => {
    const config = stepConfigs[stepId];
    if (!config) {
      throw new Error(`스텝 구성을 찾을 수 없음: ${stepId}`);
    }

    return {
      id: generateUniqueId(),
      config,
      status: "pending",
      timestamp: formatTimestamp(),
    };
  };

  // 스텝 상태 업데이트 함수
  const updateStepStatus = (
    stepId: string,
    status: StepStatus,
    result?: StepResult
  ) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, status, result } : step
      )
    );
  };

  // 스텝 실행 함수
  const executeStep = async (step: Step) => {
    // 중지 상태면 실행하지 않음
    if (workflowStatus !== "running") return;

    // 현재 실행 중인 스텝 ID 설정
    currentStepIdRef.current = step.id;

    // 로깅 추가
    console.log(`스텝 실행 시작: ${step.config.id}, ${step.config.title}`);

    // 실행 중 상태로 업데이트
    updateStepStatus(step.id, "processing");

    try {
      // 스텝 처리 함수 실행
      console.log(`프로세스 함수 호출: ${step.config.id}`);
      const result = await step.config.process(step.data);
      console.log(`프로세스 함수 완료: ${step.config.id}`, result);

      // 중간에 워크플로우가 중지됐는지 확인
      if (workflowStatus !== "running") return;

      // 성공 상태로 업데이트
      updateStepStatus(step.id, "completed", result);

      // 다음 스텝 처리
      const nextStepId = result.success
        ? step.config.nextStepOnSuccess
        : step.config.nextStepOnFailure;

      if (nextStepId) {
        // 다음 스텝 생성 및 추가
        const nextStep = createStep(nextStepId);
        addStep(nextStep);

        // 자동 실행 스텝이면 바로 실행
        if (nextStep.config.executeImmediately) {
          executeStep(nextStep);
        } else {
          // 사용자 입력 대기 상태로 설정
          updateStepStatus(nextStep.id, "waiting");
        }
      } else {
        // 다음 스텝이 없으면 워크플로우 완료
        setWorkflowStatus("completed");
      }
    } catch (error) {
      // 중간에 워크플로우가 중지됐는지 확인
      if (workflowStatus !== "running") return;

      console.error("스텝 실행 오류:", error);

      // 실패 상태로 업데이트
      const errorResult: StepResult = {
        success: false,
        message: error.message || "알 수 없는 오류",
      };

      updateStepStatus(step.id, "failed", errorResult);

      // 실패 시 다음 스텝
      const nextStepId = step.config.nextStepOnFailure;
      if (nextStepId) {
        // 다음 스텝 생성 및 추가
        const nextStep = createStep(nextStepId);
        addStep(nextStep);

        // 자동 실행 스텝이면 바로 실행
        if (nextStep.config.executeImmediately) {
          executeStep(nextStep);
        } else {
          // 사용자 입력 대기 상태로 설정
          updateStepStatus(nextStep.id, "waiting");
        }
      }
    } finally {
      // 현재 실행 중인 스텝 ID 초기화
      currentStepIdRef.current = null;
    }
  };

  // 스텝 추가 함수
  const addStep = (step: Step) => {
    setSteps((prevSteps) => [step, ...prevSteps]);
    return step;
  };

  // 워크플로우 시작 함수
  const startWorkflow = () => {
    // 이미 실행 중이면 무시
    if (workflowStatus === "running") return;

    // 스텝 목록 초기화
    setSteps([]);

    // 워크플로우 상태 업데이트
    setWorkflowStatus("running");

    // 첫 번째 스텝 생성 및 실행
    const initialStep = createStep(initialStepId);
    addStep(initialStep);
    executeStep(initialStep);
  };

  // 워크플로우 중지 함수
  const stopWorkflow = () => {
    // 이미 중지됐으면 무시
    if (workflowStatus !== "running") return;

    // 워크플로우 상태 업데이트
    setWorkflowStatus("stopped");

    // 중지 메시지 추가
    const stopStep = {
      id: generateUniqueId(),
      config: {
        id: "workflowStopped" as StepId,
        title: "워크플로우 중지",
        executeImmediately: true,
        process: async () => ({
          success: true,
          message: "워크플로우가 중지되었습니다.",
        }),
        processingMessage: "워크플로우를 중지 중입니다.",
        successMessage: "워크플로우가 중지되었습니다.",
        failureMessage: "워크플로우 중지 중 오류가 발생했습니다.",
        nextStepOnSuccess: null,
        nextStepOnFailure: null,
      },
      status: "completed" as StepStatus,
      result: {
        success: true,
        message: "워크플로우가 중지되었습니다.",
      },
      timestamp: formatTimestamp(),
    };

    addStep(stopStep);
  };

  // 사용자 액션 핸들러 함수
  const handleAction = (stepId: string, action: string, data?: any) => {
    // 중지 상태면 처리하지 않음
    if (workflowStatus !== "running") return;

    // 해당 스텝 찾기
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    switch (action) {
      case "execute":
        // 스텝 데이터 업데이트 후 실행
        console.log(`사용자 액션: ${action}, 스텝 ID: ${stepId}`, data);
        const updatedStep = { ...step, data };
        executeStep(updatedStep);
        break;

      case "skip":
        // 스텝 건너뛰기 - 다음 스텝으로
        console.log(`사용자 액션: ${action}, 스텝 ID: ${stepId}`);
        updateStepStatus(stepId, "completed", {
          success: true,
          message: "사용자에 의해 건너뛰기 되었습니다.",
        });

        // 다음 스텝 처리
        const nextStepId = step.config.nextStepOnSuccess;
        if (nextStepId) {
          const nextStep = createStep(nextStepId);
          addStep(nextStep);

          if (nextStep.config.executeImmediately) {
            executeStep(nextStep);
          } else {
            updateStepStatus(nextStep.id, "waiting");
          }
        }
        break;

      default:
        console.warn(`알 수 없는 액션: ${action}`);
    }
  };

  return {
    steps,
    workflowStatus,
    startWorkflow,
    stopWorkflow,
    handleAction,
  };
}

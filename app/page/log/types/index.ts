/**
 * 스텝의 실행 상태를 정의합니다.
 */
export type StepStatus =
  | "pending" // 대기 중
  | "processing" // 처리 중
  | "completed" // 완료됨
  | "failed" // 실패함
  | "waiting"; // 사용자 입력 대기 중

/**
 * 전체 워크플로우 상태를 정의합니다.
 */
export type WorkflowStatus =
  | "idle" // 시작 전
  | "running" // 실행 중
  | "stopped" // 중지됨
  | "completed"; // 모든 스텝 완료됨

/**
 * 스텝 ID 문자열 리터럴 타입
 */
export type StepId =
  | "verifyKey" // 발급키 확인
  | "verifyToken" // 토큰 확인
  | "issueToken" // 토큰 발급
  | "checkTokenTime" // 토큰 남은 시간 확인
  | "checkStockBalance" // 주식 잔고 확인
  | "checkPendingOrders" // 미채결 내역 조회
  | "sellStock" // 매도
  | "buyStock"; // 매수

/**
 * 스텝 실행 결과
 */
export interface StepResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 스텝 구성 인터페이스
 */
export interface StepConfig {
  id: StepId;
  title: string;
  executeImmediately: boolean;
  process: (data?: any) => Promise<StepResult>;
  processingMessage: string;
  successMessage: string;
  failureMessage: string | ((error: any) => string);
  nextStepOnSuccess: StepId | null;
  nextStepOnFailure: StepId | null;
  renderContent?: (props: StepProps) => React.ReactNode;
}

/**
 * 스텝 인스턴스 (실행 중 스텝)
 */
export interface Step {
  id: string; // 고유 ID
  config: StepConfig; // 스텝 구성
  status: StepStatus; // 현재 상태
  result?: StepResult; // 실행 결과
  data?: any; // 스텝 데이터
  timestamp: string; // 생성 시간
}

/**
 * 스텝 컴포넌트 프롭스
 */
export interface StepProps {
  step: Step;
  onComplete: (result: StepResult) => void;
  onAction: (action: string, data?: any) => void;
  workflowStatus: WorkflowStatus;
}

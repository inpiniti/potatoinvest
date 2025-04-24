/**
 * 로그 말풍선 컴포넌트
 */
import React from "react";
import { Loader2 } from "lucide-react";
import { Step, WorkflowStatus } from "../types";
import { stepConfigs } from "../config/steps";
import { KeyVerifyStep } from "./StepComponents/KeyVerifyStep";
import { TokenVerifyStep } from "./StepComponents/TokenVerifyStep";
import { TokenIssueStep } from "./StepComponents/TokenIssueStep";
import { TokenTimeStep } from "./StepComponents/TokenTimeStep";
import { StockBalanceStep } from "./StepComponents/StockBalanceStep";
import { OrderCheckStep } from "./StepComponents/OrderCheckStep";
import { SellStep } from "./StepComponents/SellStep";
import { BuyStep } from "./StepComponents/BuyStep";

interface LogBubbleProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (stepId: string, action: string, data?: any) => void;
}

/**
 * 스텝 ID에 맞는 컴포넌트 선택
 */
const getStepComponent = (stepId: string) => {
  switch (stepId) {
    case "verifyKey":
      return KeyVerifyStep;
    case "verifyToken":
      return TokenVerifyStep;
    case "issueToken":
      return TokenIssueStep;
    case "checkTokenTime":
      return TokenTimeStep;
    case "checkStockBalance":
      return StockBalanceStep;
    case "checkPendingOrders":
      return OrderCheckStep;
    case "sellStock":
      return SellStep;
    case "buyStock":
      return BuyStep;
    default:
      return null;
  }
};

export const LogBubble: React.FC<LogBubbleProps> = ({
  step,
  workflowStatus,
  onAction,
}) => {
  // 스텝 상태에 따른 메시지 결정
  const getMessage = () => {
    const { status, result, config } = step;

    switch (status) {
      case "pending":
        return "대기 중...";
      case "processing":
        return config.processingMessage;
      case "completed":
        return typeof config.successMessage === "function"
          ? config.successMessage(result)
          : config.successMessage;
      case "failed":
        return typeof config.failureMessage === "function" && result
          ? config.failureMessage(result)
          : config.failureMessage;
      case "waiting":
        return "사용자 입력 대기 중...";
      default:
        return "";
    }
  };

  // 스텝에 맞는 컴포넌트 가져오기
  const StepComponent = getStepComponent(step.config.id);

  return (
    <div className="flex justify-end mb-4">
      <div className="bg-white rounded-lg shadow p-4 max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{step.timestamp}</span>
          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
            {step.config.title}
          </span>
        </div>

        <div className="mb-2">
          <p className="text-gray-700">{getMessage()}</p>
        </div>

        {/* 처리 중일 때 로딩 표시 */}
        {step.status === "processing" && (
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            처리 중...
          </div>
        )}

        {/* 특화 컴포넌트 렌더링 */}
        {StepComponent && (
          <StepComponent
            step={step}
            workflowStatus={workflowStatus}
            onAction={(action, data) => onAction(step.id, action, data)}
          />
        )}
      </div>
    </div>
  );
};

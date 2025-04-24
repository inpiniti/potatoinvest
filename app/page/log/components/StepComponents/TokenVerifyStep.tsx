/**
 * 토큰 확인 스텝 컴포넌트
 */
import React from "react";
import { StepBase } from "../StepBase";
import { Step, WorkflowStatus } from "../../types";

interface TokenVerifyStepProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (action: string, data?: any) => void;
}

export const TokenVerifyStep: React.FC<TokenVerifyStepProps> = ({
  step,
  workflowStatus,
  onAction,
}) => {
  // 완료된 경우 추가 정보 표시
  const renderCompletedInfo = () => {
    if (step.status !== "completed" || !step.result) return null;

    const { data } = step.result;
    if (!data?.tokenInfo) return null;

    return (
      <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
        <p>
          <span className="font-medium">남은 시간:</span>{" "}
          {data.tokenInfo.expiresIn}초
        </p>
      </div>
    );
  };

  return (
    <StepBase step={step} workflowStatus={workflowStatus} onAction={onAction}>
      {renderCompletedInfo()}
    </StepBase>
  );
};

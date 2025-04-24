/**
 * 토큰 시간 확인 스텝 컴포넌트
 */
import React from "react";
import { StepBase } from "../StepBase";
import { Step, WorkflowStatus } from "../../types";

interface TokenTimeStepProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (action: string, data?: any) => void;
}

export const TokenTimeStep: React.FC<TokenTimeStepProps> = ({
  step,
  workflowStatus,
  onAction,
}) => {
  // 완료된 경우 추가 정보 표시
  const renderCompletedInfo = () => {
    if (step.status !== "completed" || !step.result) return null;

    const { data } = step.result;
    if (!data) return null;

    // 남은 시간을 분:초 형태로 표시
    const minutes = Math.floor(data.remainingTime / 60);
    const seconds = data.remainingTime % 60;
    const formattedTime = `${minutes}분 ${seconds}초`;

    return (
      <div className="mt-2 text-sm bg-blue-50 p-2 rounded flex justify-between items-center">
        <p>
          <span className="font-medium">남은 시간:</span> {formattedTime}
        </p>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{
              width: `${Math.min(100, (data.remainingTime / 3600) * 100)}%`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <StepBase step={step} workflowStatus={workflowStatus} onAction={onAction}>
      {renderCompletedInfo()}
    </StepBase>
  );
};

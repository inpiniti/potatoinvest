/**
 * 모든 스텝 컴포넌트의 기본 구조를 정의합니다.
 */
import React from "react";
import { Button } from "@/components/ui/button";
import { Step, WorkflowStatus } from "../types";

interface StepBaseProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (action: string, data?: any) => void;
  children?: React.ReactNode;
  actionButtons?: React.ReactNode;
}

export const StepBase: React.FC<StepBaseProps> = ({
  step,
  workflowStatus,
  onAction,
  children,
  actionButtons,
}) => {
  const isDisabled =
    workflowStatus !== "running" ||
    step.status === "processing" ||
    step.status === "completed" ||
    step.status === "failed";

  return (
    <div className="mt-3 border-t pt-3">
      {children}

      {step.status === "waiting" && actionButtons}

      {/* 기본 건너뛰기 버튼 - 커스텀 액션 버튼이 없을 때만 표시 */}
      {step.status === "waiting" && !actionButtons && (
        <div className="flex justify-end mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("skip")}
            disabled={isDisabled}
          >
            건너뛰기
          </Button>
        </div>
      )}
    </div>
  );
};

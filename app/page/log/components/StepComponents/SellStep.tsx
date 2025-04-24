/**
 * 매도 스텝 컴포넌트
 * 사용자 확인이 필요한 스텝의 예시입니다.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Step, WorkflowStatus } from "../../types";
import { StepBase } from "../StepBase";

interface SellStepProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (action: string, data?: any) => void;
}

export const SellStep: React.FC<SellStepProps> = ({
  step,
  workflowStatus,
  onAction,
}) => {
  // 매도 수량 상태
  const [quantity, setQuantity] = useState(1);

  // 예시 데이터 (실제로는 이전 스텝에서 넘어온 데이터를 사용)
  const stockData = {
    symbol: "AAPL",
    name: "Apple Inc.",
    currentPrice: 175.2,
    previousPrice: 167.5,
    changePercent: 4.6,
    prediction: 64, // 상승 예측 확률
  };

  const handleSell = () => {
    onAction("execute", {
      symbol: stockData.symbol,
      quantity,
    });
  };

  // 이미 처리된 스텝이면 결과만 표시
  if (step.status === "completed" || step.status === "failed") {
    return null;
  }

  // 사용자 입력 대기 중일 때만 인터랙션 UI 표시
  if (step.status === "waiting") {
    return (
      <StepBase
        step={step}
        workflowStatus={workflowStatus}
        onAction={onAction}
        actionButtons={
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction("skip")}
              disabled={workflowStatus !== "running"}
            >
              건너뛰기
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSell}
              disabled={workflowStatus !== "running"}
            >
              매도하기
            </Button>
          </div>
        }
      >
        <div className="bg-blue-50 p-3 rounded-md mb-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-medium">{stockData.symbol}</span>
              <span className="text-gray-500 ml-1 text-sm">
                {stockData.name}
              </span>
            </div>
            <div className="text-green-600 font-medium">
              ${stockData.currentPrice.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <span
                className={`${
                  stockData.changePercent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stockData.changePercent >= 0 ? "+" : ""}
                {stockData.changePercent}%
              </span>
              <span className="mx-2 text-gray-400">|</span>
              <span className="text-blue-600">
                상승예측: {stockData.prediction}%
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="font-medium">{quantity}주</span>
              <button
                className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </StepBase>
    );
  }

  return null;
};

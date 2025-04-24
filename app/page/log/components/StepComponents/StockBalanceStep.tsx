/**
 * 주식 잔고 확인 스텝 컴포넌트
 */
import React from "react";
import { StepBase } from "../StepBase";
import { Step, WorkflowStatus } from "../../types";

interface StockBalanceStepProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (action: string, data?: any) => void;
}

export const StockBalanceStep: React.FC<StockBalanceStepProps> = ({
  step,
  workflowStatus,
  onAction,
}) => {
  // 완료된 경우 주식 잔고 정보 표시
  const renderStockBalances = () => {
    if (step.status !== "completed" || !step.result) return null;

    const { data } = step.result;
    if (!data?.stocks || data.stocks.length === 0) {
      return (
        <div className="mt-2 text-sm bg-yellow-50 p-2 rounded">
          <p>보유 중인 주식이 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-2">보유 주식 목록</h4>
        <div className="space-y-2">
          {data.stocks.map((stock: any, index: number) => {
            // 수익률 계산
            const profitRate =
              ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) *
              100;
            const isProfitable = profitRate >= 0;

            return (
              <div key={index} className="bg-white p-2 rounded border text-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-gray-500 ml-1 text-xs">
                      {stock.name}
                    </span>
                  </div>
                  <span
                    className={isProfitable ? "text-green-600" : "text-red-600"}
                  >
                    {isProfitable ? "+" : ""}
                    {profitRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{stock.quantity}주</span>
                  <span>${stock.currentPrice.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-sm font-medium text-right">
          총 평가금액: ${data.totalBalance.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <StepBase step={step} workflowStatus={workflowStatus} onAction={onAction}>
      {renderStockBalances()}
    </StepBase>
  );
};

/**
 * 미체결 내역 조회 스텝 컴포넌트
 */
import React from "react";
import { StepBase } from "../StepBase";
import { Step, WorkflowStatus } from "../../types";

interface OrderCheckStepProps {
  step: Step;
  workflowStatus: WorkflowStatus;
  onAction: (action: string, data?: any) => void;
}

export const OrderCheckStep: React.FC<OrderCheckStepProps> = ({
  step,
  workflowStatus,
  onAction,
}) => {
  // 완료된 경우 미체결 내역 표시
  const renderPendingOrders = () => {
    if (step.status !== "completed" || !step.result) return null;

    const { data } = step.result;
    if (!data?.pendingOrders || data.pendingOrders.length === 0) {
      return (
        <div className="mt-2 text-sm bg-green-50 p-2 rounded">
          <p>미체결 주문이 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-2">미체결 주문 목록</h4>
        <div className="space-y-2">
          {data.pendingOrders.map((order: any, index: number) => (
            <div key={index} className="bg-white p-2 rounded border text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{order.symbol}</span>
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                      order.type === "buy"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {order.type === "buy" ? "매수" : "매도"}
                  </span>
                </div>
                <span className="text-purple-600 font-medium">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{order.quantity}주</span>
                <span>${order.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <StepBase step={step} workflowStatus={workflowStatus} onAction={onAction}>
      {renderPendingOrders()}
    </StepBase>
  );
};

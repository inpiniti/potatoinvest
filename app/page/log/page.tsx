"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useWorkflow } from "./hooks/useWorkflow";
import { LogBubble } from "./components/LogBubble";

const Log = () => {
  const { steps, workflowStatus, startWorkflow, stopWorkflow, handleAction } =
    useWorkflow();

  // 실행 중인지 확인
  const isRunning = workflowStatus === "running";

  const handleButtonClick = () => {
    if (!isRunning) {
      startWorkflow();
    } else {
      stopWorkflow();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto p-4">
      <section className="bg-white border rounded-md p-4 flex justify-between items-center gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold">자동 매매</h1>
          <p className="text-muted-foreground">
            시작버튼을 눌러 인공지능을 활용하여 자동 매매를 진행해보세요.
            브라우저 종료시 종료됩니다.
          </p>
        </div>
        <Button onClick={handleButtonClick}>
          {isRunning && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          {isRunning ? "중지" : "시작"}
        </Button>
      </section>

      <div className="flex flex-col-reverse">
        {/* 역순으로 정렬하여 최신 로그가 맨 아래에 오도록 함 */}
        {steps.map((step) => (
          <LogBubble
            key={step.id}
            step={step}
            workflowStatus={workflowStatus}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
};

export default Log;

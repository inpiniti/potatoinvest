"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LogItem {
  id: number;
  date: string;
  content: string;
  loading: boolean;
}

const contentList = [
  "구매 가능 여부 체크 중 입니다...",
  "연속 하락한 주식 필터링 하는 중 입니다...",
  "실시간 데이터를 가져오는 중입니다...",
  "최고가 대비 많이 하락한 주식 조회 중입니다.",
  "구매중입니다...",
  "보유한 종목중 오른 것이 있는지 확인중입니다...",
];

const completeList = [
  "삼성전자 1주를 구매하였습니다.",
  "구매가 완료되었습니다.",
  "구매한 만큼 보유한 자산에서 마이너스 하였습니다.",
];

// 1. 발급된 토큰이 있는지 확인

// 2. 없다면 토큰 발급,

// 3. 발급된 토큰이 있다면 남은 시간 확인

// 4. 남은 시간이 0 이하라면 토큰 재발급

// 5. appkey 와 secretkey가 입력되어 있는지 확인

// 6. appkey 와 secretkey 를 통한 토큰 발급

// 7. 해외주식 잔고 조회

// 8. 해외주식 잔고중 2% 이상 상승한 종목이 있는지 확인

// 9. 2% 이상 상승한 종목이 있다면 전 수량 매도주문

// 10. 매도 주문이 완료되었다면 매수 주문

// 11. 최근 한달간 가장 많이 하락한 종목 sort 조회

const Log = () => {
  const [start, setStart] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [log, setLog] = useState<LogItem[]>([]);

  // 임의의 로그 아이템(로딩 중) 생성 함수
  const createPendingLog = () => {
    const randomContent =
      contentList[Math.floor(Math.random() * contentList.length)];

    const newLogItem: LogItem = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      content: randomContent,
      loading: true,
    };

    setLog((prev) => [newLogItem, ...prev]);

    // 지정된 시간 후 로딩 해제 + 완료 상태로 업데이트
    setTimeout(() => {
      const randomComplete =
        completeList[Math.floor(Math.random() * completeList.length)];

      setLog((prev) =>
        prev.map((item) =>
          item.id === newLogItem.id
            ? { ...item, content: randomComplete, loading: false }
            : item
        )
      );
    }, 3000);
  };

  const run = () => {
    // 1) run 함수 호출 시 즉시 1회 실행
    createPendingLog();

    // 2) 이후 4초 간격으로 실행
    const id = setInterval(() => {
      createPendingLog();
    }, 4000);

    setTimerId(id);
  };

  const stop = () => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  };

  // Stop the timer when leaving this page
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border rounded-sm p-4 flex justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold">자동 매매</h1>
          <p className="text-muted-foreground">
            시작버튼을 눌러 인공지능을 활용하여 자동 매매를 진행해보세요.
            브라우저 종료시 종료됩니다.
          </p>
        </div>
        <Button
          onClick={() => {
            if (!start) {
              run();
            } else {
              stop();
            }
            setStart(!start);
          }}
        >
          {start && (
            <figure>
              <Loader2 className="w-5 h-5 animate-spin" />
            </figure>
          )}
          {start ? "중지" : "시작"}
        </Button>
      </section>
      {log.map(
        (item, index) =>
          item && (
            <section key={index} className="flex justify-end">
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-neutral-400">{item.date}</p>
                <div className="bg-white p-4 rounded-sm flex gap-2 items-center">
                  {item.loading && (
                    <figure>
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </figure>
                  )}
                  <p>{item.content}</p>
                </div>
              </div>
            </section>
          )
      )}
    </div>
  );
};
export default Log;

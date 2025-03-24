'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import useToken from '../../../hooks/useToken';

interface LogItem {
  date: string;
  content: string;
  loading: boolean;
}

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

  const [발급된토큰확인] = useToken();

  // 로딩 추가
  const loading = (message: string) => {
    const newLogItem: LogItem = {
      date: new Date().toLocaleString(),
      content: message,
      loading: true,
    };
    setLog((prev) => [newLogItem, ...prev]);
  };

  // 완료
  const complete = (message: string) => {
    setLog((prev) =>
      prev.map((item, index) =>
        index === 0 ? { ...item, content: message, loading: false } : item
      )
    );
  };

  // 1. 발급된 토큰이 있는지 확인
  const 토큰확인 = async () => {
    // 발급된 토큰이 있는지 확인 중입니다.
    loading('발급된 토큰이 있는지 확인 중입니다.');
    // 확인 로직
    const result = await 발급된토큰확인();

    // 발급된 토큰이 없습니다.
    // or 토큰을 발급합니다.
    if (result) complete('발급된 토큰이 있습니다.');
    else complete('발급된 토큰이 없습니다. 토큰을 발급합니다.');
  };

  const run = async () => {
    // 1) run 함수 호출 시 즉시 1회 실행
    // createPendingLog();

    // // 2) 이후 4초 간격으로 실행
    // const id = setInterval(() => {
    //   createPendingLog();
    // }, 4000);

    // setTimerId(id);

    await 토큰확인();
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
          {start ? '중지' : '시작'}
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

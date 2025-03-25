"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useToken from "../../../hooks/useToken";
import useKey from "@/hooks/useKey";
import useTrading from "@/hooks/useTrading";
import useAi from "@/hooks/useAi";

import aiModels from "@/json/ai_models.json";
import useQuotations from "@/hooks/useQuotations";

const Log = () => {
  const [start, setStart] = useState(false);
  const [log, setLog] = useState([]);
  const [models, setModels] = useState([]);
  const abortControllerRef = useRef(null);

  const { 발급받은키확인 } = useKey();
  const { 발급된토큰확인, 토큰발급, 토큰남은시간확인 } = useToken();
  const { 주식잔고확인, 매도확인, 물타기확인, 매도, 매수 } = useTrading();
  const { 데이터가져오기, 전처리, 역직렬화, 예측 } = useAi();
  const { 현재가상세 } = useQuotations();

  const [오늘한번이라도구매한종목코드, set오늘한번이라도구매한종목코드] =
    useState([]);

  // 로딩 추가
  const loading = (message) => {
    const newLogItem = {
      date: new Date().toLocaleString(),
      content: message,
      loading: true,
    };
    setLog((prev) => [newLogItem, ...prev]);
  };

  // 완료
  const complete = (message) => {
    setLog((prev) =>
      prev.map((item, index) =>
        index === 0 ? { ...item, content: message, loading: false } : item
      )
    );
  };

  const 확인 = async ({ 로딩메시지, 성공메시지, 실패메시지, 함수 }) => {
    loading(로딩메시지);

    const result = await 함수();

    if (result?.msg1) {
      complete(실패메시지 + " : " + result?.msg1);
    } else if (result) {
      complete(성공메시지);
    } else {
      complete(실패메시지);
    }

    if (abortControllerRef.current?.signal.aborted) {
      loading("확인 작업이 중단되었습니다.");
      complete("확인 작업이 중단되었습니다.");
      return;
    }

    return result;
  };

  const 작업 = async ({ 로딩메시지, 성공메시지, 실패메시지, 함수 }) => {
    loading(로딩메시지);

    const result = await 함수();

    if (result?.msg1) {
      complete(실패메시지 + " : " + result?.msg1);
    } else if (result) {
      complete(성공메시지);
    } else {
      complete(실패메시지);
    }

    if (abortControllerRef.current?.signal.aborted) {
      loading("확인 작업이 중단되었습니다.");
      complete("확인 작업이 중단되었습니다.");
      return;
    }

    return result;
  };

  const run = async () => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    await 토큰발급영역();

    if (abortControllerRef.current?.signal.aborted) {
      loading("확인 작업이 중단되었습니다.");
      complete("확인 작업이 중단되었습니다.");
      return;
    }

    const 반복실행 = async () => {
      if (abortControllerRef.current?.signal.aborted) {
        loading("확인 작업이 중단되었습니다.");
        complete("확인 작업이 중단되었습니다.");
        return;
      }

      const 주식잔고 = await 매도및물타기영역();

      if (abortControllerRef.current?.signal.aborted) {
        loading("확인 작업이 중단되었습니다.");
        complete("확인 작업이 중단되었습니다.");
        return;
      }

      await 매수영역(주식잔고);
      반복실행();
    };

    반복실행();
  };

  const 토큰발급영역 = async () => {
    const isKey = await 확인({
      로딩메시지: "발급받은 키가 있는지 확인 중입니다.",
      성공메시지: "발급받은 키가 있습니다.",
      실패메시지: "발급받은 키가 없습니다.",
      함수: 발급받은키확인,
    });
    if (!isKey) return;

    const isToken = await 확인({
      로딩메시지: "발급된 토큰이 있는지 확인 중입니다.",
      성공메시지: "발급된 토큰이 있습니다.",
      실패메시지: "발급된 토큰이 없습니다. 토큰을 발급합니다.",
      함수: 발급된토큰확인,
    });

    if (isToken) {
      const is남은시간 = await 확인({
        로딩메시지: "남은 시간을 확인합니다.",
        성공메시지: "남은 시간이 있습니다.",
        실패메시지: "남은 시간이 없습니다. 토큰을 발급합니다.",
        함수: 토큰남은시간확인,
      });

      if (!is남은시간) {
        const is발급 = await 확인({
          로딩메시지: "토큰을 발급합니다.",
          성공메시지: "토큰이 발급되었습니다.",
          실패메시지: "토큰 발급에 실패했습니다.",
          함수: 토큰발급,
        });

        if (!is발급) return;
      }
    } else {
      const is발급 = await 확인({
        로딩메시지: "토큰을 발급합니다.",
        성공메시지: "토큰이 발급되었습니다.",
        실패메시지: "토큰 발급에 실패했습니다.",
        함수: 토큰발급,
      });

      if (!is발급) return;
    }
  };

  const 매도및물타기영역 = async () => {
    const 주식잔고 = await 작업({
      로딩메시지: "주식잔고를 확인합니다.",
      성공메시지: "주식잔고가 있습니다.",
      실패메시지: "주식잔고가 없습니다.",
      함수: 주식잔고확인,
    });

    let index = 0;
    for (const item of 주식잔고 || []) {
      index++;
      const is매도 = await 확인({
        로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도를 해도 될지 계산중입니다...`,
        성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도를 해도 될 것 같습니다.`,
        실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 조금 더 기다렸다가 매도해야 할 것 같습니다.`,
        함수: () => 매도확인(item),
      });

      if (!is매도) {
        const is물타기 = await 확인({
          로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기를 해도 될지 계산중입니다...`,
          성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기를 해도 될 것 같습니다.`,
          실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 조금 더 기다렸다가 물타기해야 할 것 같습니다.`,
          함수: () => 물타기확인(item),
        });

        if (is물타기) {
          const 매수결과 = await 작업({
            로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기중입니다...`,
            성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기가 완료되었습니다.`,
            실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기에 실패했습니다.`,
            함수: () => 매수(item),
          });
        }
        // 물타기 실행
      } else {
        // 매도 실행
        const 매도결과 = await 작업({
          로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도중입니다...`,
          성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도가 완료되었습니다.`,
          실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도에 실패했습니다.`,
          함수: () => 매도(item),
        });
      }
    }

    return 주식잔고;
  };

  const 매수영역 = async (주식잔고) => {
    const 분석할데이터 = await 작업({
      로딩메시지: "분석할 데이터를 조회중입니다...",
      성공메시지: "분석할 데이터를 조회했습니다.",
      실패메시지: "분석할 데이터 조회에 실패했습니다.",
      함수: 데이터가져오기,
    });

    const 전처리된분석데이터 = await 작업({
      로딩메시지: "분석할 데이터를 전처리중입니다...",
      성공메시지: "분석할 데이터를 전처리했습니다.",
      실패메시지: "분석할 데이터 전처리에 실패했습니다.",
      함수: () => 전처리(분석할데이터),
    });

    const 모델들 =
      models.length > 0
        ? models
        : await 작업({
            로딩메시지: "모델을 로딩중입니다...",
            성공메시지: "모델을 로딩했습니다.",
            실패메시지: "모델 로딩에 실패했습니다.",
            함수: async () => {
              const loadedModels = await Promise.all(
                aiModels.ai_models.map((model) =>
                  역직렬화(model.model, model.weights)
                )
              );
              setModels(loadedModels);
              return loadedModels;
            },
          });

    // 모든 모델에 대해 예측 수행
    const 예측결과들 = await 작업({
      로딩메시지: "예측중입니다...",
      성공메시지: "예측이 완료되었습니다.",
      실패메시지: "예측에 실패했습니다.",
      함수: async () => {
        const predictions = await Promise.all(
          모델들.map((model) => 예측(model, 전처리된분석데이터))
        );
        return predictions;
      },
    });

    const 분석된데이터 = await 작업({
      로딩메시지: "예측 분석중입니다...",
      성공메시지: "분석이 완료되었습니다.",
      실패메시지: "분석에 실패했습니다.",
      함수: async () => {
        // 예측 결과의 평균 계산
        const 예측결과평균 = 예측결과들[0].map(
          (_, colIndex) =>
            예측결과들.reduce((sum, row) => sum + row[colIndex], 0) /
            예측결과들.length
        );

        // 분석할 데이터에 예측 결과 추가
        const 최종분석데이터 = 분석할데이터.map((row, index) => ({
          ...row,
          예측결과: 예측결과평균[index],
        }));

        const 예측결과가높은데이터 = 최종분석데이터.sort(
          (a, b) => b.예측결과 - a.예측결과
        );

        return 예측결과가높은데이터;
      },
    });

    // 분석된 데이터에서 주식 잔고에 있는건 제외해야 함.
    // 분석된 데이터의 key 는 name 이고,
    // 잔고의 키는 ovrs_pdno 이다.

    const 매수할데이터 = 분석된데이터
      .filter(
        (item) =>
          !(주식잔고 || []).find((balance) => balance.ovrs_pdno === item.name)
      )
      .filter((item) => !오늘한번이라도구매한종목코드.includes(item.name))
      .filter((item) => {
        return item.예측결과 > 0.7;
      });

    for (const item of 매수할데이터) {
      const 현재가 = await 작업({
        로딩메시지: `${item.name} (${item.description}) 현재가를 조회중입니다...`,
        성공메시지: `${item.name} (${item.description}) 현재가를 조회했습니다.`,
        실패메시지: `${item.name} (${item.description}) 현재가 조회에 실패했습니다.`,
        함수: () => 현재가상세(item.name),
      });

      if (현재가) {
        const 매수결과 = await 작업({
          로딩메시지: `${item.name} (${item.description}) (${현재가.last}) 매수중입니다...`,
          성공메시지: `${item.name} (${item.description}) (${현재가.last}) 매수가 완료되었습니다.`,
          실패메시지: `${item.name} (${item.description}) (${현재가.last}) 매수에 실패했습니다.`,
          함수: () =>
            매수({
              ovrs_pdno: item.name,
              ovrs_cblc_qty: "1",
              now_pric2: 현재가.last,
            }),
        });

        if (매수결과 && !매수결과?.msg1) {
          console.log("매수성공");
          set오늘한번이라도구매한종목코드((prev) => {
            if (!prev.includes(item.name)) {
              return [...prev, item.name];
            }
            return prev;
          });
        } else {
          console.log("매수실패");
        }
      }
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
      {log.slice(0, 100).map(
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

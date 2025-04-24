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
import { delay } from "@/utils/util";
import { settingStore } from "@/store/settingStore";

import ConfirmationCard from "./ConfirmationCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Log = () => {
  const [start, setStart] = useState(false);
  const [log, setLog] = useState([]);
  const [models, setModels] = useState([]);
  const abortControllerRef = useRef(null);
  const [진행중인가요, set진행중인가요] = useState(false);

  // 예측 결과를 저장하는 상태 추가
  const [예측결과맵, set예측결과맵] = useState({});

  // 분석된데이터 결과를 전역적으로 저장할 상태 추가
  const [분석결과, set분석결과] = useState(null);

  const { 발급받은키확인 } = useKey();
  const { 발급된토큰확인, 토큰발급, 토큰남은시간확인 } = useToken();
  const { 주식잔고확인, 매도확인, 물타기확인, 미체결내역, 매도, 매수 } =
    useTrading();
  const { 데이터가져오기, 전처리, 역직렬화, 예측 } = useAi();
  const { 현재가상세 } = useQuotations();

  const [오늘한번이라도구매한종목코드, set오늘한번이라도구매한종목코드] =
    useState([]);

  // 확인 대화상자 상태 추가
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    data: null,
    type: null,
    onConfirm: null,
    onCancel: null,
    predictionData: null,
    marketData: null,
  });

  const { setting } = settingStore();

  // 로딩 추가
  const loading = (message, options = {}) => {
    const newLogItem = {
      date: new Date().toLocaleString(),
      content: message,
      loading: true,
      ...options,
    };
    setLog((prev) => [newLogItem, ...prev.slice(0, 99)]);
    return 0; // 로그 아이템의 인덱스 반환
  };

  // 완료
  const complete = (message, index = 0, options = {}) => {
    setLog((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, content: message, loading: false, ...options }
          : item
      )
    );
  };

  // 사용자 확인이 필요한 로그 항목 추가
  const addConfirmationLog = (message, confirmAction, cancelAction, data) => {
    const newLogItem = {
      date: new Date().toLocaleString(),
      content: message,
      loading: false,
      requireConfirmation: true,
      confirmAction,
      cancelAction,
      data,
    };
    setLog((prev) => [newLogItem, ...prev.slice(0, 99)]);
    return 0; // 로그 아이템의 인덱스 반환
  };

  // 확인 응답 처리
  const handleConfirm = async (index, confirm = true) => {
    // 해당 로그 항목의 확인 기능 비활성화
    setLog((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, requireConfirmation: false } : item
      )
    );

    // 선택에 따라 액션 실행
    if (confirm) {
      const logItem = log[index];
      if (logItem.confirmAction) {
        const result = await logItem.confirmAction(logItem.data);
        complete(`✅ ${logItem.content.split("?")[0]}를 실행했습니다.`, index);
      }
    } else {
      const logItem = log[index];
      if (logItem.cancelAction) {
        await logItem.cancelAction(log[index].data);
      }
      complete(`❌ ${log[index].content.split("?")[0]}를 취소했습니다.`, index);
    }
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

  // 작업 함수 수정 - 확인 필요 로직 변경
  const 작업 = async ({
    로딩메시지,
    성공메시지,
    실패메시지,
    함수,
    확인필요 = false,
    확인데이터 = null,
    거래타입 = null,
    추가데이터 = null,
  }) => {
    // 확인이 필요한 작업이면 사용자에게 확인 요청
    if (확인필요) {
      return new Promise((resolve) => {
        // 종목 코드와 추가 데이터 저장
        const 종목코드 = 확인데이터?.종목코드;
        const 예측데이터 = 추가데이터?.예측데이터;
        const 시장데이터 = 추가데이터?.시장데이터;

        // 확인 버튼 클릭 시 실행할 함수
        const confirmAction = async () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          const logIndex = loading(`${로딩메시지} 진행 중...`);
          try {
            const result = await 함수();
            if (result?.msg1) {
              complete(실패메시지 + " : " + result?.msg1, logIndex);
            } else if (result) {
              complete(성공메시지, logIndex);
            } else {
              complete(실패메시지, logIndex);
            }
            resolve(result);
          } catch (error) {
            complete(`오류 발생: ${error.message}`, logIndex);
            resolve(false);
          }
        };

        // 취소 버튼 클릭 시 실행할 함수
        const cancelAction = () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          resolve(false);
        };

        // 확인 대화상자 표시
        setConfirmDialog({
          open: true,
          data: 확인데이터,
          type:
            거래타입 ||
            (로딩메시지.includes("매도")
              ? "sell"
              : 로딩메시지.includes("매수")
              ? "buy"
              : "물타기"
              ? "average"
              : "operation"),
          onConfirm: confirmAction,
          onCancel: cancelAction,
          predictionData: 예측데이터,
          marketData: 시장데이터,
        });
      });
    } else {
      // 일반 작업은 기존 방식으로 처리
      const logIndex = loading(로딩메시지);
      const result = await 함수();

      if (result?.msg1) {
        complete(실패메시지 + " : " + result?.msg1, logIndex);
      } else if (result) {
        complete(성공메시지, logIndex);
      } else {
        complete(실패메시지, logIndex);
      }

      if (abortControllerRef.current?.signal.aborted) {
        loading("작업이 중단되었습니다.");
        complete("작업이 중단되었습니다.");
        return;
      }

      return result;
    }
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

    반복실행();
  };

  // 예측 분석 실행 함수 (매도 및 물타기 판단에 사용)
  const 예측분석실행 = async () => {
    // 분석 데이터 가져오기
    const 분석할데이터 = await 작업({
      로딩메시지: "분석할 데이터를 조회중입니다...",
      성공메시지: "분석할 데이터를 조회했습니다.",
      실패메시지: "분석할 데이터 조회에 실패했습니다.",
      함수: 데이터가져오기,
    });

    if (!분석할데이터 || 분석할데이터.length === 0) {
      loading("분석할 데이터가 없습니다.");
      complete("분석할 데이터가 없어 예측을 진행할 수 없습니다.");
      return null;
    }

    // 데이터 전처리
    const 전처리된분석데이터 = await 작업({
      로딩메시지: "분석할 데이터를 전처리중입니다...",
      성공메시지: "분석할 데이터를 전처리했습니다.",
      실패메시지: "분석할 데이터 전처리에 실패했습니다.",
      함수: () => 전처리(분석할데이터),
    });

    // AI 모델 로딩
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
        return predictions.slice(0, 100);
      },
    });

    // 예측 결과 분석
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

        // 예측 결과를 맵으로 변환하여 저장
        const 예측결과객체 = {};
        최종분석데이터.forEach((item) => {
          예측결과객체[item.name] = item.예측결과;
        });

        // 상태 업데이트
        set예측결과맵(예측결과객체);

        // 정렬된 데이터
        const 정렬된데이터 = 최종분석데이터.sort(
          (a, b) => b.예측결과 - a.예측결과
        );

        // 분석 결과를 상태에 저장
        set분석결과(정렬된데이터);

        loading(
          `총 ${최종분석데이터.length}개 종목의 예측 분석이 완료되었습니다.`
        );
        complete(
          `예측 분석 완료: 상위 5개 종목 - ${최종분석데이터
            .sort((a, b) => b.예측결과 - a.예측결과)
            .slice(0, 5)
            .map((i) => `${i.name}(${(i.예측결과 * 100).toFixed(1)}%)`)
            .join(", ")}`
        );

        return 최종분석데이터.sort((a, b) => b.예측결과 - a.예측결과);
      },
    });

    return 분석된데이터;
  };

  const 반복실행 = async () => {
    set진행중인가요(true);
    if (abortControllerRef.current?.signal.aborted) {
      loading("확인 작업이 중단되었습니다.");
      complete("확인 작업이 중단되었습니다.");
      return;
    }

    // 매 사이클마다 예측 분석 실행
    await 예측분석실행();

    const 주식잔고 = await 매도및물타기영역();

    if (abortControllerRef.current?.signal.aborted) {
      loading("확인 작업이 중단되었습니다.");
      complete("확인 작업이 중단되었습니다.");
      return;
    }

    await 매수영역(주식잔고);
    set진행중인가요(false);
  };

  useEffect(() => {
    if (!진행중인가요 && start) {
      반복실행();
    }
  }, [진행중인가요]);

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

    if (!주식잔고 || 주식잔고.length === 0) {
      loading("주식잔고가 없어 매도 및 물타기를 진행하지 않습니다.");
      complete("주식잔고가 없습니다.");
      return [];
    }

    await delay(1000);

    const 미체결 = await 작업({
      로딩메시지: "미체결내역을 확인합니다.",
      성공메시지: "미체결내역이 있습니다.",
      실패메시지: "미체결내역이 없습니다.",
      함수: 미체결내역,
    });

    let index = 0;
    for (const item of 주식잔고 || []) {
      index++;

      // 종목의 예측 결과 가져오기
      const 종목예측결과 = 예측결과맵[item.ovrs_pdno] || 0;
      const 예측결과퍼센트 = (종목예측결과 * 100).toFixed(1);

      // 매도 판단 기준: 예측 결과가 매도 기준치보다 낮으면 매도
      const 매도기준치 = setting.other.sellPredictRate / 100;

      loading(
        `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 예측결과: ${예측결과퍼센트}%, 매도기준: ${setting.other.sellPredictRate}%`
      );
      complete(
        `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 예측률 분석: ${예측결과퍼센트}%`
      );

      const is매도 = await 확인({
        로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도를 해도 될지 계산중입니다...`,
        성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도를 해도 될 것 같습니다.`,
        실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 조금 더 기다렸다가 매도해야 할 것 같습니다.`,
        함수: () => 매도확인({ ...item, 예측결과: 종목예측결과, 매도기준치 }),
      });

      // 현재가 상세 데이터 조회
      const 현재가데이터 = await 현재가상세(item.ovrs_pdno);

      // 종목에 대한 예측 데이터 검색
      const 예측데이터 = 분석결과?.find((d) => d.name === item.ovrs_pdno);

      if (!is매도) {
        // 이미 체결내역에 있으면 굳이 물타기할 필요가 없음
        if (
          미체결?.output?.find((order) => {
            return order.pdno === item.ovrs_pdno;
          })
        ) {
          loading(
            `${item.ovrs_pdno} (${item.ovrs_item_name}) 이미 체결내역에 있습니다.`
          );
          complete(
            `${item.ovrs_pdno} (${item.ovrs_item_name}) 이미 체결내역에 있습니다.`
          );
          continue;
        }

        // 물타기 판단 기준: 예측 결과가 물타기 기준치보다 높으면 물타기
        const 물타기기준치 = setting.other.buyPredictRate / 100;

        const is물타기 = await 확인({
          로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기를 해도 될지 계산중입니다...`,
          성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기를 해도 될 것 같습니다.`,
          실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 조금 더 기다렸다가 물타기해야 할 것 같습니다.`,
          함수: () =>
            물타기확인({ ...item, 예측결과: 종목예측결과, 물타기기준치 }),
        });

        if (is물타기) {
          // 물타기는 사용자 확인을 받음
          const 매수결과 = await 작업({
            로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기중입니다...`,
            성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기가 완료되었습니다.`,
            실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 물타기에 실패했습니다.`,
            함수: () => 매수(item),
            확인필요: true, // 사용자 확인 필요
            확인데이터: {
              종목코드: item.ovrs_pdno,
              종목명: item.ovrs_item_name,
              현재가: Number(item.now_pric2),
              평균매수가: Number(item.pchs_avg_pric),
              수익률: Number(item.evlu_pfls_rt),
              예측률: 예측결과퍼센트 + "%",
            },
            거래타입: "average",
            추가데이터: {
              예측데이터: 예측데이터,
              시장데이터: 현재가데이터,
            },
          });
        }
        // 물타기 실행
      } else {
        // 매도는 사용자 확인을 받음
        const 매도결과 = await 작업({
          로딩메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도중입니다...`,
          성공메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도가 완료되었습니다.`,
          실패메시지: `${index}/${주식잔고.length} ${item.ovrs_pdno} (${item.ovrs_item_name}) 매도에 실패했습니다.`,
          함수: () => 매도(item),
          확인필요: true, // 사용자 확인 필요
          확인데이터: {
            종목코드: item.ovrs_pdno,
            종목명: item.ovrs_item_name,
            현재가: Number(item.now_pric2),
            평균매수가: Number(item.pchs_avg_pric),
            수익률: Number(item.evlu_pfls_rt),
            예측률: 예측결과퍼센트 + "%",
          },
          거래타입: "sell",
          추가데이터: {
            예측데이터: 예측데이터,
            시장데이터: 현재가데이터,
          },
        });
      }
    }

    return 주식잔고;
  };

  const 매수영역 = async (주식잔고) => {
    // 미체결 내역 조회 추가
    const 미체결 = await 작업({
      로딩메시지: "미체결내역을 확인합니다.",
      성공메시지: "미체결내역이 있습니다.",
      실패메시지: "미체결내역이 없습니다.",
      함수: 미체결내역,
    });

    // 분석 결과가 없으면 예측 분석 재실행 (이 경우는 거의 없겠지만 안전장치)
    if (!분석결과) {
      loading("분석 결과가 없습니다. 분석을 다시 실행합니다.");
      const 새분석결과 = await 예측분석실행();

      // 여전히 분석 결과가 없으면 진행 중단
      if (!새분석결과 || !분석결과) {
        // 분석결과 상태도 확인
        loading("분석 실패: 매수 작업을 중단합니다.");
        complete("분석 데이터가 없어 매수를 진행할 수 없습니다.");
        return;
      }
    }

    // 미체결 내역에서 종목 코드 추출
    const 미체결종목코드 = (미체결?.output || []).map((order) => order.pdno);

    // 로그로 미체결 종목 확인
    if (미체결종목코드.length > 0) {
      loading(`미체결 내역: ${미체결종목코드.join(", ")}`);
      complete(
        `미체결 종목은 매수 대상에서 제외합니다: ${미체결종목코드.join(", ")}`
      );
    }

    // 분석된 데이터에서 주식 잔고에 있는건 제외해야 함.
    // 분석된 데이터의 key 는 name 이고,
    // 잔고의 키는 ovrs_pdno 이다.

    const 매수할데이터 = 분석결과
      .filter(
        (item) =>
          !(주식잔고 || []).find((balance) => balance.ovrs_pdno === item.name)
      )
      // 미체결 내역에 있는 종목 제외
      .filter((item) => !미체결종목코드.includes(item.name))
      .filter((item) => !오늘한번이라도구매한종목코드.includes(item.name))
      .filter((item) => {
        return item.예측결과 > setting.other.minPredictRate / 100;
      });

    // 매수 대상 종목 로그
    if (매수할데이터.length > 0) {
      loading(
        `매수 대상 종목: ${매수할데이터.map((item) => item.name).join(", ")}`
      );
      complete(
        `총 ${매수할데이터.length}개의 종목을 매수 대상으로 선정했습니다.`
      );
    } else {
      loading("매수 대상 종목이 없습니다.");
      complete("매수 대상 종목이 없습니다. 다음 분석을 기다립니다.");
      return;
    }

    for (const item of 매수할데이터) {
      const 현재가 = await 작업({
        로딩메시지: `${item.name} (${item.description}) 현재가를 조회중입니다...`,
        성공메시지: `${item.name} (${item.description}) 현재가를 조회했습니다.`,
        실패메시지: `${item.name} (${item.description}) 현재가 조회에 실패했습니다.`,
        함수: () => 현재가상세(item.name),
      });

      if (현재가) {
        const 현재가격 = Number(현재가.last);
        const 현재가표시 = isNaN(현재가격) ? 현재가.last : 현재가격.toFixed(2);

        const 매수결과 = await 작업({
          로딩메시지: `${item.name} (${item.description}) (${현재가표시}) 매수중입니다...`,
          성공메시지: `${item.name} (${item.description}) (${현재가표시}) 매수가 완료되었습니다.`,
          실패메시지: `${item.name} (${item.description}) (${현재가표시}) 매수에 실패했습니다.`,
          함수: () =>
            매수({
              ovrs_pdno: item.name,
              ovrs_cblc_qty: "1",
              now_pric2: 현재가.last,
            }),
          확인필요: true, // 사용자 확인 필요
          확인데이터: {
            종목코드: item.name,
            종목명: item.description,
            현재가: 현재가.last,
            예측률: (item.예측결과 * 100).toFixed(1) + "%",
          },
          거래타입: "buy",
          추가데이터: {
            예측데이터: item,
            시장데이터: 현재가,
          },
        });

        if (매수결과 && !매수결과?.msg1) {
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
      {log.map(
        (item, index) =>
          item && (
            <section key={index} className="flex justify-end">
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-neutral-400">{item.date}</p>
                <div className="bg-white p-4 rounded-sm flex flex-col gap-2 justify-end">
                  <div className="flex items-center gap-2">
                    {item.loading && (
                      <figure>
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      </figure>
                    )}
                    <p>{item.content}</p>
                  </div>
                  {/* 사용자 확인이 필요한 경우 버튼 표시 */}
                  {item.requireConfirmation && (
                    <div className="flex flex-col gap-2 items-end">
                      {item.data && (
                        <div className="flex-1 text-left text-sm text-gray-500">
                          <div>
                            종목: {item.data.종목코드} ({item.data.종목명})
                          </div>
                          <div>
                            현재가: $
                            {
                              // 현재가를 숫자로 변환하고 toFixed 적용, NaN인 경우 처리
                              typeof item.data.현재가 === "number"
                                ? item.data.현재가.toFixed(2)
                                : Number(item.data.현재가)
                                ? Number(item.data.현재가).toFixed(2)
                                : item.data.현재가
                            }
                          </div>
                          {item.data.평균매수가 && (
                            <div>
                              평균매수가: $
                              {typeof item.data.평균매수가 === "number"
                                ? item.data.평균매수가.toFixed(2)
                                : Number(item.data.평균매수가)
                                ? Number(item.data.평균매수가).toFixed(2)
                                : item.data.평균매수가}
                            </div>
                          )}
                          {item.data.수익률 && (
                            <div
                              className={
                                Number(item.data.수익률) > 0
                                  ? "text-red-500"
                                  : "text-blue-500"
                              }
                            >
                              수익률:{" "}
                              {typeof item.data.수익률 === "number"
                                ? item.data.수익률.toFixed(2)
                                : Number(item.data.수익률)
                                ? Number(item.data.수익률).toFixed(2)
                                : item.data.수익률}
                              %
                            </div>
                          )}
                          <div>AI 예측: {item.data.예측률}</div>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleConfirm(index, false)}
                        >
                          취소
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleConfirm(index, true)}
                        >
                          확인
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
      )}

      {/* 확인 대화상자 추가 */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => {
          if (!open) confirmDialog.onCancel?.();
          setConfirmDialog((prev) => ({ ...prev, open }));
        }}
      >
        <DialogContent className="sm:max-w-md">
          <ConfirmationCard
            data={confirmDialog.data}
            type={confirmDialog.type}
            onConfirm={confirmDialog.onConfirm}
            onCancel={confirmDialog.onCancel}
            predictionData={confirmDialog.predictionData}
            marketData={confirmDialog.marketData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Log;

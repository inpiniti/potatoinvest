import { useState, useCallback, useEffect, useMemo } from "react";
import useApi from "@/hooks/useApi";
import useAi from "@/hooks/useAi";
import useTrading from "@/hooks/useTrading";
import useAccount from "@/hooks/useAccount";
import aiModels from "@/json/ai_models.json";

const useStockData = () => {
  const api = useApi();
  const { 데이터가져오기, 전처리, 역직렬화, 예측 } = useAi();
  const { 미체결내역 } = useTrading();
  const [cano, acntPrdtCd] = useAccount();

  // 데이터 상태 관리
  const [분석데이터, set분석데이터] = useState([]);
  const [체결데이터, set체결데이터] = useState([]);
  const [구매데이터, set구매데이터] = useState([]);

  // 로딩 상태 관리
  const [분석데이터로딩, set분석데이터로딩] = useState(true);
  const [체결데이터로딩, set체결데이터로딩] = useState(true);
  const [구매데이터로딩, set구매데이터로딩] = useState(true);

  // AI 모델 상태 관리
  const [models, setModels] = useState([]);

  // 분석 데이터 가져오기 및 AI 예측
  const fetch분석데이터 = useCallback(async () => {
    console.log("fetch분석데이터");
    try {
      set분석데이터로딩(true);

      // 1. 데이터 가져오기
      const 데이터 = await 데이터가져오기();

      // 2. 데이터 전처리
      const 전처리된데이터 = await 전처리(데이터);

      // 3. 모델 로드 (한 번만)
      let 사용할모델들 = models;
      if (models.length === 0) {
        try {
          const loadedModels = await Promise.all(
            aiModels.ai_models.map((model) =>
              역직렬화(model.model, model.weights)
            )
          );
          setModels(loadedModels);
          사용할모델들 = loadedModels;
        } catch (modelError) {
          console.warn("모델 로딩 실패:", modelError);
        }
      }

      // 4. 모든 모델에 대해 예측 수행
      const 예측결과들 = await Promise.all(
        사용할모델들.map((model) => 예측(model, 전처리된데이터))
      );

      // 5. 예측 결과 평균 계산
      const 예측결과평균 = 예측결과들[0].map(
        (_, colIndex) =>
          예측결과들.reduce((sum, row) => sum + row[colIndex], 0) /
          예측결과들.length
      );

      // 6. 분석할 데이터에 예측 결과 추가
      const 최종분석데이터 = 데이터.map((row, index) => ({
        ...row,
        예측결과: 예측결과평균[index],
        type: "분석",
      }));

      set분석데이터(최종분석데이터);
    } catch (error) {
      console.error("분석 데이터 로드 실패:", error);

      // 재시도 로직
      if (retryCount > 0) {
        console.warn(`분석 데이터 재시도 중... 남은 시도 횟수: ${retryCount}`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
        return fetch분석데이터(retryCount - 1);
      } else {
        console.error("분석 데이터 재시도 실패: 모든 시도 종료");
        set분석데이터([]); // 빈 데이터로 설정
      }
    } finally {
      set분석데이터로딩(false);
    }
  }, [데이터가져오기, 전처리, 역직렬화, 예측, models]);

  // 필터링된 분석 데이터 (렌더링시 필터링)
  const 필터링된분석데이터 = useMemo(() => {
    // 미체결/보유 종목 코드 세트 생성
    const 미체결종목코드 = new Set(
      체결데이터.map((item) => item.name || item.pdno || "")
    );
    const 보유종목코드 = new Set(
      구매데이터.map((item) => item.name || item.ovrs_pdno || "")
    );

    return 분석데이터
      .filter((item) => item.예측결과 >= 0.6) // 예측 점수 0.6 이상
      .filter((item) => item.close !== undefined && item.close >= 1) // 종가 1 이상
      .filter((item) => {
        // 한달 변동률이 -10% 이하인 종목만 선택
        const monthlyPerf = item.perf_1_m !== undefined ? item.perf_1_m : 0;
        return monthlyPerf <= 0;
      })
      .filter((item) => {
        // 미체결 종목과 보유 중인 종목 제거
        const itemCode = item.name || item.code || "";
        return !미체결종목코드.has(itemCode) && !보유종목코드.has(itemCode);
      })
      .sort((a, b) => {
        // perf_1_m이 없는 경우 기본값 0으로 처리
        const aPerf = a.perf_1_m !== undefined ? a.perf_1_m : 0;
        const bPerf = b.perf_1_m !== undefined ? b.perf_1_m : 0;
        return aPerf - bPerf; // 오름차순 정렬 (가장 하락폭이 큰 순)
      });
  }, [분석데이터, 체결데이터, 구매데이터]);

  // 체결 데이터(미체결 내역) 가져오기
  const fetch체결데이터 = useCallback(async () => {
    try {
      set체결데이터로딩(true);
      if (cano && acntPrdtCd) {
        const data = await 미체결내역();

        // 처리된 미체결 데이터를 일단 생성
        let 처리된체결데이터 = (data.output || []).map((item) => ({
          ...item,
          type: "체결",
          name: item.pdno,
        }));

        // 분석데이터에서 일치하는 항목의 예측 결과를 조인
        처리된체결데이터 = 처리된체결데이터.map((item) => {
          // 분석 데이터에서 매칭되는 항목 찾기
          const matchingAnalysis = 분석데이터.find(
            (analysis) =>
              analysis.name === item.pdno || analysis.code === item.pdno
          );

          // 일치하는 항목이 있으면 예측 결과 사용, 없으면 예측 결과 없음
          return {
            ...item,
            예측결과: matchingAnalysis ? matchingAnalysis.예측결과 : undefined,
          };
        });

        set체결데이터(처리된체결데이터);
      }
    } catch (error) {
      console.error("체결 데이터 로드 실패:", error);
      set체결데이터([]);
    } finally {
      set체결데이터로딩(false);
    }
  }, [cano, acntPrdtCd, 미체결내역, 분석데이터]);

  // 구매 데이터(보유 종목) 가져오기
  const fetch구매데이터 = useCallback(async () => {
    try {
      set구매데이터로딩(true);
      if (cano && acntPrdtCd) {
        const payload = {
          CANO: cano,
          ACNT_PRDT_CD: acntPrdtCd,
          OVRS_EXCG_CD: "NASD",
          TR_CRCY_CD: "USD",
          CTX_AREA_FK200: "",
          CTX_AREA_NK200: "",
        };

        const response = await api.trading.inquireBalance(payload);
        const data = await response.json();

        // 처리된 구매 데이터 생성
        let 처리된구매데이터 = (data.output1 || []).map((item) => ({
          ...item,
          type: "구매",
          name: item.ovrs_pdno,
        }));

        // 분석데이터에서 일치하는 항목의 예측 결과를 조인
        처리된구매데이터 = 처리된구매데이터.map((item) => {
          // 분석 데이터에서 매칭되는 항목 찾기
          const matchingAnalysis = 분석데이터.find(
            (analysis) =>
              analysis.name === item.ovrs_pdno ||
              analysis.code === item.ovrs_pdno
          );

          return {
            ...item,
            // 일치하는 항목이 있으면 예측 결과 사용, 없으면 수익률을 표시용으로 사용
            예측결과: matchingAnalysis
              ? matchingAnalysis.예측결과
              : parseFloat(item.evlu_pfls_rt) / 100,
          };
        });

        // 수익률 evlu_pfls_rt 로 소팅
        const 소팅된데이터 = 처리된구매데이터.sort((a, b) => {
          const aPerf = a.evlu_pfls_rt !== undefined ? a.evlu_pfls_rt : 0;
          const bPerf = b.evlu_pfls_rt !== undefined ? b.evlu_pfls_rt : 0;
          return aPerf - bPerf; // 오름차순 정렬 (가장 낮은 수익률 순)
        });

        set구매데이터(소팅된데이터);
      }
    } catch (error) {
      console.error("구매 데이터 로드 실패:", error);
      set구매데이터([]);
    } finally {
      set구매데이터로딩(false);
    }
  }, [cano, acntPrdtCd, api, 분석데이터]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // initial load
    fetch분석데이터();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; fetch분석데이터 internal deps manage logic
  }, []);

  useEffect(() => {
    if (분석데이터) {
      // 분석 데이터가 변경될 때마다 체결 데이터와 구매 데이터를 새로고침
      fetch체결데이터();
      fetch구매데이터();
    }
  }, [분석데이터, fetch체결데이터, fetch구매데이터]);

  // 특정 데이터 타입의 로딩 상태 확인
  const isLoading = useCallback(
    (type) => {
      if (type === "분석") return 분석데이터로딩;
      if (type === "체결") return 체결데이터로딩;
      if (type === "구매") return 구매데이터로딩;
      if (type === "any")
        return 분석데이터로딩 || 체결데이터로딩 || 구매데이터로딩;
      return false;
    },
    [분석데이터로딩, 체결데이터로딩, 구매데이터로딩]
  );

  return {
    분석데이터,
    체결데이터,
    구매데이터,
    필터링된분석데이터,
    isLoading,
    fetch분석데이터,
    fetch체결데이터,
    fetch구매데이터,
  };
};

export default useStockData;

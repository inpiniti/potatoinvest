"use client";

import { Card } from "@/components/ui/card";

import { ArrowDown, ArrowUp, Loader2 } from "lucide-react"; // 추가: 로딩 아이콘

import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";
import useAi from "@/hooks/useAi"; // AI 훅 추가
import aiModels from "@/json/ai_models.json"; // AI 모델 데이터 추가

import { useCallback, useEffect, useMemo, useState } from "react";

import useTrading from "@/hooks/useTrading";
import { Button } from "@/components/ui/button";

import StockCard from "./StockCard"; // StockCard 컴포넌트 임포트

const Buy = () => {
  const api = useApi();
  const { 미체결내역 } = useTrading();
  const { 데이터가져오기, 전처리, 역직렬화, 예측 } = useAi(); // AI 훅 사용

  const [cano, acntPrdtCd] = useAccount();
  const [list, setList] = useState([]);
  const [미체결리스트, set미체결리스트] = useState([]);
  const [loading, setLoading] = useState(true); // 추가: 로딩 상태
  const [predictionsLoading, setPredictionsLoading] = useState(false); // 예측 로딩 상태
  const [predictions, setPredictions] = useState([]); // 예측 결과 저장
  const [models, setModels] = useState([]); // AI 모델 상태

  // 정렬 상태 추가
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' 또는 'desc'

  // 환율 상태 추가
  const [exchangeRate, setExchangeRate] = useState(1350); // 기본값 설정 (1 USD = 1350 KRW)
  const [showKRW, setShowKRW] = useState(true); // 원화 표시 여부

  /**
   * 예측 수행 함수
   * @returns {Promise<void>}
   */
  const runPredictions = useCallback(async () => {
    try {
      setPredictionsLoading(true);

      // 1. 데이터 가져오기
      const 분석할데이터 = await 데이터가져오기();

      // 2. 데이터 전처리
      const 전처리된분석데이터 = await 전처리(분석할데이터);

      // 3. 모델 로드 (한 번만)
      let 사용할모델들 = models;
      if (models.length === 0) {
        const loadedModels = await Promise.all(
          aiModels.ai_models.map((model) =>
            역직렬화(model.model, model.weights)
          )
        );
        setModels(loadedModels);
        사용할모델들 = loadedModels;
      }

      // 4. 모든 모델에 대해 예측 수행
      const 예측결과들 = await Promise.all(
        사용할모델들.map((model) => 예측(model, 전처리된분석데이터))
      );

      // 5. 예측 결과 평균 계산
      const 예측결과평균 = 예측결과들[0].map(
        (_, colIndex) =>
          예측결과들.reduce((sum, row) => sum + row[colIndex], 0) /
          예측결과들.length
      );

      // 6. 분석할 데이터에 예측 결과 추가
      const 최종분석데이터 = 분석할데이터.map((row, index) => ({
        ...row,
        예측결과: 예측결과평균[index],
      }));

      setPredictions(최종분석데이터);
    } catch (error) {
      console.error("예측 중 오류:", error);
    } finally {
      setPredictionsLoading(false);
    }
  }, [데이터가져오기, 전처리, 역직렬화, 예측, models]);

  // 환율 정보 가져오기
  const fetchExchangeRate = useCallback(async () => {
    try {
      // 실제 환율 API 호출
      // 여기서는 예시로 하드코딩된 값을 사용하지만, 실제로는 API를 호출해야 합니다
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // setExchangeRate(data.rates.KRW);

      // 실제 API 호출 대신 임시로 설정
      setExchangeRate(1500); // 1 USD = 1350 KRW (예시)
    } catch (error) {
      console.error("환율 정보 가져오기 실패:", error);
      // 오류 시 기본값 사용
      setExchangeRate(1500);
    }
  }, []);

  /**
   * 보유 종목 목록을 조회하는 함수
   * @returns {Promise<void>}
   */
  const getList = useCallback(async () => {
    try {
      setLoading(true); // 로딩 시작
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

        setList(data.output1 || []);
      }
    } catch (error) {
      console.error("보유종목 조회 실패:", error);
    } finally {
      setLoading(false); // 로딩 종료
    }
  }, []);

  /**
   * 미체결 내역을 조회하는 함수
   * @returns {Promise<void>}
   */
  const 미체결내역조회 = async () => {
    try {
      const data = await 미체결내역();
      set미체결리스트(data.output || []);
    } catch (error) {
      console.error("미체결 내역 조회 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchExchangeRate(); // 환율 정보 가져오기
    getList();
    미체결내역조회();
  }, []);

  // 미체결 내역을 포함한 종목 목록
  const 미체결list = useMemo(() => {
    const pdno = 미체결리스트?.map((미체결) => 미체결.pdno) || [];

    // 미체결 정보 병합
    let result = list.map((item) => {
      if (pdno.includes(item.ovrs_pdno)) {
        return {
          ...item,
          결제중: true,
        };
      } else {
        return {
          ...item,
          결제중: false,
        };
      }
    });

    // 평가손익 기준으로 정렬
    if (result.length > 0) {
      result.sort((a, b) => {
        const aValue = Number(a.evlu_pfls_rt);
        const bValue = Number(b.evlu_pfls_rt);

        if (sortOrder === "asc") {
          return aValue - bValue; // 오름차순: 손실 -> 수익
        } else {
          return bValue - aValue; // 내림차순: 수익 -> 손실
        }
      });
    }

    return result;
  }, [미체결리스트, list, sortOrder]);

  /**
   * 매도 완료 후 호출되는 함수
   * 미체결 내역을 재조회합니다
   */
  const handleSellComplete = useCallback(() => {
    //setTimeout(() => {
    미체결내역조회(); // 약간의 지연 후 미체결 내역 재조회
    //getList(); // 보유 종목 목록도 갱신
    //}, 1000); // 서버 반영 시간을 고려해 1초 대기
  }, []);

  // 화폐 단위 변환 함수 추가
  const formatCurrency = useCallback(
    (value, currency = "USD") => {
      const numValue = Number(value);
      if (isNaN(numValue)) return "0.00";

      if (currency === "USD") {
        return `$${numValue?.toFixed(2)}`;
      } else if (currency === "KRW") {
        return `₩${Math.round(numValue * exchangeRate).toLocaleString()}`;
      }
    },
    [exchangeRate]
  );

  // 포트폴리오 요약 계산 (원화 지원 추가)
  const portfolioSummary = useMemo(() => {
    if (!미체결list?.length)
      return { totalProfit: 0, totalInvestment: 0, profitRate: 0 };

    const summary = 미체결list.reduce(
      (acc, item) => {
        const investment =
          Number(item.pchs_avg_pric) * Number(item.ovrs_cblc_qty);
        const currentValue =
          Number(item.now_pric2) * Number(item.ovrs_cblc_qty);
        const profit = currentValue - investment;

        return {
          totalInvestment: acc.totalInvestment + investment,
          totalCurrentValue: acc.totalCurrentValue + currentValue,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { totalInvestment: 0, totalCurrentValue: 0, totalProfit: 0 }
    );

    const profitRate = summary.totalInvestment
      ? (summary.totalProfit / summary.totalInvestment) * 100
      : 0;

    return {
      ...summary,
      profitRate,
    };
  }, [미체결list]);

  return (
    <div className="space-y-4">
      {/* 예측 상태 표시 */}
      {predictionsLoading && (
        <div className="bg-white p-4 rounded-md border flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">
            AI 예측 정보를 분석 중입니다...
          </p>
        </div>
      )}

      {/* 포트폴리오 요약 섹션 추가 */}
      {!loading && 미체결list?.length > 0 && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">포트폴리오 요약</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKRW(!showKRW)}
              className="text-xs"
            >
              {showKRW ? "원화 숨기기" : "원화 표시"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runPredictions}
              disabled={predictionsLoading}
              className="text-xs flex items-center gap-1"
            >
              {predictionsLoading && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              AI 예측 갱신
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">
                전체 매입금액
              </h3>
              <p className="text-xl font-bold">
                {formatCurrency(portfolioSummary.totalInvestment)}
                {showKRW && (
                  <div className="text-sm font-medium text-neutral-500 mt-1">
                    {formatCurrency(portfolioSummary.totalInvestment, "KRW")}
                  </div>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">
                전체 실현손익
              </h3>
              <p
                className={`text-xl font-bold ${
                  portfolioSummary.totalProfit > 0
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
              >
                {formatCurrency(portfolioSummary.totalProfit)}
                {showKRW && (
                  <div className="text-sm font-medium text-neutral-500 mt-1">
                    {formatCurrency(portfolioSummary.totalProfit, "KRW")}
                  </div>
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">
                전체 손익률
              </h3>
              <p
                className={`text-xl font-bold ${
                  portfolioSummary.profitRate > 0
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
              >
                {portfolioSummary.profitRate?.toFixed(2)}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 정렬 버튼 */}
      <div className="flex justify-end pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={setSortOrder.bind(
            null,
            sortOrder === "asc" ? "desc" : "asc"
          )}
          className="flex items-center gap-2"
        >
          평가손익
          {sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          // 로딩 상태 표시
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className="text-gray-500">보유 종목을 불러오는 중입니다...</p>
            </div>
          </div>
        ) : 미체결list?.length > 0 ? (
          // 종목 목록 표시 - 각 카드를 StockCard 컴포넌트로 분리
          미체결list.map((item) => (
            <StockCard
              key={item.STK_CD || item.ovrs_pdno}
              item={item}
              onSellComplete={handleSellComplete}
              predictions={predictions} // 예측 결과 전달
            />
          ))
        ) : (
          // 데이터 없음 상태
          <div className="col-span-full flex justify-center items-center py-12">
            <p className="text-gray-500">보유 종목이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buy;

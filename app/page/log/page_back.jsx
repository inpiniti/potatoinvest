"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Info, ArrowLeft, ArrowRight } from "lucide-react";
import useApi from "@/hooks/useApi";
import useAi from "@/hooks/useAi";
import useTrading from "@/hooks/useTrading";
import useAccount from "@/hooks/useAccount";
import aiModels from "@/json/ai_models.json";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { logos } from "@/json/logoData";

const Log = () => {
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
  const [activeTab, setActiveTab] = useState("분석");

  // 종목 선택
  const [selectedStock, setSelectedStock] = useState(null);

  // 분석 데이터 가져오기 및 AI 예측
  const fetch분석데이터 = useCallback(async () => {
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

      // 필터링: 예측 점수가 0.6 이상인 종목만 선택
      const 필터링된데이터 = 최종분석데이터
        .filter((item) => item.예측결과 >= 0.6)
        .filter((item) => item.close !== undefined && item.close >= 1)
        .sort((a, b) => b.예측결과 - a.예측결과);

      // 3. 정렬: 한달 성과(perf_1_m)가 낮은 순으로 정렬 (하락폭이 큰 순)
      const 정렬된데이터 = 필터링된데이터.sort((a, b) => {
        // perf_1_m이 없는 경우 기본값 0으로 처리
        const aPerf = a.perf_1_m !== undefined ? a.perf_1_m : 0;
        const bPerf = b.perf_1_m !== undefined ? b.perf_1_m : 0;

        return aPerf - bPerf; // 오름차순 정렬 (가장 하락폭이 큰 순)
      });

      set분석데이터(최종분석데이터);
    } catch (error) {
      console.error("분석 데이터 로드 실패:", error);
      set분석데이터([]);
    } finally {
      set분석데이터로딩(false);
    }
  }, [데이터가져오기, 전처리, 역직렬화, 예측, models]);

  // 렌더링 부분 수정 - 분석 데이터 탭에서 필터링하여 표시
  const 필터링된분석데이터 = useMemo(() => {
    // 먼저 미체결 종목 코드들과 보유 종목 코드들을 추출하여 Set 생성
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
        return monthlyPerf <= -10;
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
  }, [분석데이터, 체결데이터, 구매데이터]); // 의존성 배열에 체결데이터, 구매데이터 추가

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
          // 임시 예측 결과는 제거
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
          // 예측 결과를 일단 포함시키지 않음
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
          return bPerf - aPerf; // 내림차순 정렬 (가장 높은 수익률 순)
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

  // 모든 데이터 새로고침
  const refreshAll = useCallback(async () => {
    await fetch분석데이터();
    //fetch체결데이터();
    //fetch구매데이터();
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    // 분석 데이터가 변경될 때마다 체결 데이터와 구매 데이터를 새로고침
    fetch체결데이터();
    fetch구매데이터();
  }, [분석데이터]);

  // 특정 데이터 타입의 로딩 상태 확인
  const isLoading = (type) => {
    if (type === "분석") return 분석데이터로딩;
    if (type === "체결") return 체결데이터로딩;
    if (type === "구매") return 구매데이터로딩;
    return false;
  };

  // 로고 아이콘 가져오기
  const getLogoUrl = (item) => {
    // 1. 아이템에 logoid가 있으면 그대로 사용
    if (item.logoid) {
      return `https://s3-symbol-logo.tradingview.com/${item.logoid}--big.svg`;
    }

    // 2. 종목코드로 로고 찾기
    const stockCode = item.name || item.ovrs_pdno || item.pdno || item.code;
    if (stockCode) {
      // logos 배열에서 일치하는 로고 찾기
      const logo = logos.find((logo) => logo.name === stockCode);
      if (logo && logo.logoid) {
        return `https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`;
      }
    }

    // 3. 로고가 없으면 빈 문자열 반환
    return "";
  };

  // 아이콘 렌더링 함수
  const renderAppIcon = (item) => {
    const logoUrl = getLogoUrl(item);
    const displayName = (item.name || item.code || "N/A").substring(0, 6);

    // 예측 결과(확률) 계산
    const predictionValue =
      item.예측결과 !== undefined
        ? `${(item.예측결과 * 100).toFixed(0)}%`
        : "N/A";

    // 데이터 타입에 따라 다른 정보 표시
    let additionalInfo = null;

    if (item.type === "분석" && item.perf_1_m !== undefined) {
      // 분석 데이터: 한달 성과(하락률) 계산
      const monthlyPerf = item.perf_1_m.toFixed(1);
      additionalInfo = (
        <span
          className={`text-[10px] ${
            parseFloat(monthlyPerf) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ({monthlyPerf > 0 ? "+" : ""}
          {monthlyPerf}%)
        </span>
      );
    } else if (item.type === "구매" && item.evlu_pfls_rt !== undefined) {
      // 보유 종목: 구매 후 변동량(수익률) 표시
      const changeValue = Number(item.evlu_pfls_rt).toFixed(2);
      additionalInfo = (
        <span
          className={`text-[10px] ${
            parseFloat(changeValue) >= 0 ? "text-green-600" : "text-red-600"
          } font-semibold`}
        >
          ({changeValue > 0 ? "+" : ""}
          {changeValue}%)
        </span>
      );
    }

    return (
      <div
        className="flex flex-col items-center w-24 mb-4"
        onClick={() => setSelectedStock(item.name)}
      >
        <Avatar
          className={`w-14 h-14 rounded-2xl ${
            selectedStock === item.name
              ? "ring-2 ring-red-500 ring-offset-2 bg-white shadow-lg transform scale-105 transition-all"
              : "bg-gray-100 filter grayscale opacity-80 transition-all hover:grayscale-0 hover:opacity-100"
          }`}
        >
          <AvatarImage
            src={logoUrl}
            alt={displayName}
            className="object-contain"
          />
          <AvatarFallback className="text-lg font-bold bg-white text-gray-800">
            {displayName.substring(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="mt-2 text-center">
          {/* 종목코드 표시 */}
          <p className="text-xs font-semibold truncate w-20 text-center">
            {displayName}
          </p>

          {/* 확률과 하락률 함께 표시 */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {/* 예측 확률 */}
            <span
              className={`text-xs ${
                parseInt(predictionValue) >= 60
                  ? "text-green-600"
                  : "text-red-600"
              } font-bold`}
            >
              {predictionValue}
            </span>

            {/* 추가 정보 (한달 성과 또는 변동량) */}
            {additionalInfo}
          </div>
        </div>
      </div>
    );
  };

  // Log 컴포넌트 내부에 추가할 함수
  const moveToNextStock = useCallback(() => {
    if (!selectedStock) {
      // 선택된 종목이 없으면 첫 번째 종목 선택
      const firstStock =
        필터링된분석데이터[0]?.name ||
        체결데이터[0]?.name ||
        구매데이터[0]?.name;
      if (firstStock) setSelectedStock(firstStock);
      return;
    }

    // 현재 활성화된 탭에 따라 데이터 선택
    let currentData = [];
    if (activeTab === "분석") currentData = 필터링된분석데이터;
    else if (activeTab === "체결") currentData = 체결데이터;
    else if (activeTab === "구매") currentData = 구매데이터;

    if (currentData.length === 0) return;

    // 현재 선택된 종목의 인덱스 찾기
    const currentIndex = currentData.findIndex(
      (item) =>
        (item.name || item.code || item.ovrs_pdno || item.pdno) ===
        selectedStock
    );

    // 다음 인덱스 계산 (마지막 종목이면 첫 종목으로 순환)
    const nextIndex =
      currentIndex === -1 || currentIndex === currentData.length - 1
        ? 0
        : currentIndex + 1;

    // 다음 종목 선택
    const nextStock =
      currentData[nextIndex]?.name ||
      currentData[nextIndex]?.code ||
      currentData[nextIndex]?.ovrs_pdno ||
      currentData[nextIndex]?.pdno;

    if (nextStock) setSelectedStock(nextStock);
  }, [selectedStock, activeTab, 필터링된분석데이터, 체결데이터, 구매데이터]);

  const moveToPrevStock = useCallback(() => {
    if (!selectedStock) {
      // 선택된 종목이 없으면 첫 번째 종목 선택
      const firstStock =
        필터링된분석데이터[0]?.name ||
        체결데이터[0]?.name ||
        구매데이터[0]?.name;
      if (firstStock) setSelectedStock(firstStock);
      return;
    }

    // 현재 활성화된 탭에 따라 데이터 선택
    let currentData = [];
    if (activeTab === "분석") currentData = 필터링된분석데이터;
    else if (activeTab === "체결") currentData = 체결데이터;
    else if (activeTab === "구매") currentData = 구매데이터;

    if (currentData.length === 0) return;

    // 현재 선택된 종목의 인덱스 찾기
    const currentIndex = currentData.findIndex(
      (item) =>
        (item.name || item.code || item.ovrs_pdno || item.pdno) ===
        selectedStock
    );

    // 이전 인덱스 계산 (첫 종목이면 마지막 종목으로 순환)
    const prevIndex =
      currentIndex === -1 || currentIndex === 0
        ? currentData.length - 1
        : currentIndex - 1;

    // 이전 종목 선택
    const prevStock =
      currentData[prevIndex]?.name ||
      currentData[prevIndex]?.code ||
      currentData[prevIndex]?.ovrs_pdno ||
      currentData[prevIndex]?.pdno;

    if (prevStock) setSelectedStock(prevStock);
  }, [selectedStock, activeTab, 필터링된분석데이터, 체결데이터, 구매데이터]);

  return (
    <div className="space-y-4">
      {/* 헤더 및 새로고침 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-md">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={moveToPrevStock}
            disabled={
              (activeTab === "분석" && 필터링된분석데이터.length === 0) ||
              (activeTab === "체결" && 체결데이터.length === 0) ||
              (activeTab === "구매" && 구매데이터.length === 0)
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {selectedStock ? (
            <div className="font-medium">
              <span className="text-gray-500 text-sm">선택된 종목:</span>{" "}
              {selectedStock}
            </div>
          ) : (
            <div className="font-medium text-xl">데이터 로그</div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={moveToNextStock}
            disabled={
              (activeTab === "분석" && 필터링된분석데이터.length === 0) ||
              (activeTab === "체결" && 체결데이터.length === 0) ||
              (activeTab === "구매" && 구매데이터.length === 0)
            }
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {selectedStock}
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={분석데이터로딩 || 체결데이터로딩 || 구매데이터로딩}
          className="flex items-center gap-1"
        >
          {분석데이터로딩 || 체결데이터로딩 || 구매데이터로딩 ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          새로고침
        </Button>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="분석" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="분석" className="relative">
            분석 데이터
            {필터링된분석데이터.length > 0 && (
              <Badge className="absolute -top-2 -right-2 text-xs px-1 min-w-[20px] h-5 flex items-center justify-center">
                {필터링된분석데이터.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="체결" className="relative">
            미체결 내역
            {체결데이터.length > 0 && (
              <Badge className="absolute -top-2 -right-2 text-xs px-1 min-w-[20px] h-5 flex items-center justify-center">
                {체결데이터.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="구매" className="relative">
            보유 종목
            {구매데이터.length > 0 && (
              <Badge className="absolute -top-2 -right-2 text-xs px-1 min-w-[20px] h-5 flex items-center justify-center">
                {구매데이터.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 분석 데이터 탭 */}
        <TabsContent value="분석" className="mt-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold">분석 데이터</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          AI가 분석한 상승 확률이 높은 종목들입니다. 예측 점수가
                          60% 이상인 종목만 표시됩니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetch분석데이터}
                  disabled={분석데이터로딩}
                >
                  {분석데이터로딩 ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    "갱신"
                  )}
                </Button>
              </div>

              {isLoading("분석") ? (
                <div className="flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                    <p className="text-gray-500">
                      분석 데이터를 불러오는 중입니다...
                    </p>
                  </div>
                </div>
              ) : 필터링된분석데이터.length > 0 ? (
                <div className="flex flex-wrap gap-1 justify-start">
                  {필터링된분석데이터.map((item) => (
                    <div key={item.name || item.code} className="flex-shrink-0">
                      {renderAppIcon(item)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">분석 데이터가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 체결 데이터 탭 */}
        <TabsContent value="체결" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold">미체결 내역</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          현재 처리 중인 주문 내역입니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetch체결데이터}
                  disabled={체결데이터로딩}
                >
                  {체결데이터로딩 ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    "갱신"
                  )}
                </Button>
              </div>

              {isLoading("체결") ? (
                <div className="flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                    <p className="text-gray-500">
                      미체결 내역을 불러오는 중입니다...
                    </p>
                  </div>
                </div>
              ) : 체결데이터.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-start">
                  {체결데이터.map((item) => (
                    <div key={item.name || item.code} className="flex-shrink-0">
                      {renderAppIcon(item)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">현재 미체결 내역이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 구매 데이터 탭 */}
        <TabsContent value="구매" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold">보유 종목</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-2 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          현재 보유 중인 종목 목록입니다. 아이콘 색상은 수익률을
                          나타냅니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetch구매데이터}
                  disabled={구매데이터로딩}
                >
                  {구매데이터로딩 ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    "갱신"
                  )}
                </Button>
              </div>

              {isLoading("구매") ? (
                <div className="flex justify-center items-center h-40">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                    <p className="text-gray-500">
                      보유 종목 정보를 불러오는 중입니다...
                    </p>
                  </div>
                </div>
              ) : 구매데이터.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-start">
                  {구매데이터.map((item) => (
                    <div key={item.name || item.code} className="flex-shrink-0">
                      {renderAppIcon(item)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">보유 중인 종목이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Log;

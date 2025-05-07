"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import useStockData from "./hooks/useStockData";
import useStockNav from "./hooks/useStockNav";
import useStockDetail from "./hooks/useStockDetail"; // 새로 추가한 훅

// 컴포넌트 임포트
import Header from "./components/Header";
import AnalysisTab from "./components/AnalysisTab";
import OrderTab from "./components/OrderTab";
import PortfolioTab from "./components/PortfolioTab";

const Log = () => {
  const [activeTab, setActiveTab] = useState("분석");

  // 데이터 관련 훅 사용
  const {
    분석데이터,
    체결데이터,
    구매데이터,
    필터링된분석데이터,
    isLoading,
    refreshAll,
    fetch분석데이터,
    fetch체결데이터,
    fetch구매데이터,
  } = useStockData();

  // 상세 정보 조회 훅 추가
  const { loading: detailLoading, fetchStockDetail } = useStockDetail();

  // 종목 탐색 관련 훅 사용
  const {
    selectedStock,
    setSelectedStock,
    moveToNextStock,
    moveToPrevStock,
    isLoadingAnalysis,
  } = useStockNav({
    activeTab,
    setActiveTab,
    필터링된분석데이터,
    체결데이터,
    구매데이터,
    onStockChange: fetchStockDetail,
    refreshAnalysisData: fetch분석데이터, // 분석 데이터 새로고침 함수 전달
  });

  return (
    <div className="space-y-4">
      {/* 헤더 및 새로고침 버튼 */}
      <Header
        selectedStock={selectedStock}
        movePrevStock={moveToPrevStock}
        moveNextStock={moveToNextStock}
        refreshAll={refreshAll}
        isLoading={isLoading("any") || isLoadingAnalysis}
        activeTab={activeTab}
        필터링된분석데이터={필터링된분석데이터}
        체결데이터={체결데이터}
        구매데이터={구매데이터}
        onRefreshDetail={fetchStockDetail}
      />

      {/* 탭 */}
      <Tabs defaultValue="분석" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="분석" className="relative">
            분석 데이터
            {필터링된분석데이터.length > 0 && (
              <Badge className="ml-1.5 px-1 min-w-[20px] h-5 flex items-center justify-center">
                {필터링된분석데이터.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="체결" className="relative">
            미체결 내역
            {체결데이터.length > 0 && (
              <Badge className="ml-1.5 px-1 min-w-[20px] h-5 flex items-center justify-center">
                {체결데이터.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="구매" className="relative">
            보유 종목
            {구매데이터.length > 0 && (
              <Badge className="ml-1.5 px-1 min-w-[20px] h-5 flex items-center justify-center">
                {구매데이터.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 각 탭 내용 */}
        <AnalysisTab
          data={필터링된분석데이터}
          isLoading={isLoading("분석")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch분석데이터}
          fetchStockDetail={fetchStockDetail}
          detailLoading={detailLoading}
        />

        <OrderTab
          data={체결데이터}
          isLoading={isLoading("체결")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch체결데이터}
          fetchStockDetail={fetchStockDetail}
          detailLoading={detailLoading}
        />

        <PortfolioTab
          data={구매데이터}
          isLoading={isLoading("구매")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch구매데이터}
          fetchStockDetail={fetchStockDetail}
          detailLoading={detailLoading}
          체결데이터={체결데이터} // 체결 데이터 전달
        />
      </Tabs>
    </div>
  );
};

export default Log;

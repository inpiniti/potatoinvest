"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import useStockData from "./hooks/useStockData";
import useStockNav from "./hooks/useStockNav";
import useStockDetail from "./hooks/useStockDetail";
import useStockBuy from "./hooks/useStockBuy"; // 새로 추가한 매수 훅
import useStockSell from "./hooks/useStockSell"; // 매도 훅 추가

// 컴포넌트 임포트
import Header from "./components/Header";
import AnalysisTab from "./components/tabPanel/AnalysisTab";
import OrderTab from "./components/tabPanel/OrderTab";
import PortfolioTab from "./components/tabPanel/PortfolioTab";

import { toast } from "sonner";

const Log = () => {
  const [activeTab, setActiveTab] = useState("분석");
  const [autoBuy, setAutoBuy] = useState(false); // 자동 매수 활성화 여부
  const [autoSell, setAutoSell] = useState(false); // 자동 매도 활성화 여부 추가

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

  // 상세 정보 조회 훅
  const {
    detailData,
    loading: detailLoading,
    fetchStockDetail,
  } = useStockDetail();

  // 매수 훅
  const { buying, buyStock } = useStockBuy();

  // 매도 훅
  const { selling, sellStock } = useStockSell();

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
    onStockChange: (stockCode, stockObject) => {
      // 종목 변경시 상세 정보 조회 옵션
      const options = {
        activeTab,
        autoBuy,
        autoSell,
        onBuy: buyStock,
        onSell: sellStock,
        stockObject,
        체결데이터,
      };

      // 보유종목 탭인 경우 구매 조건 추가
      if (activeTab === "구매" && stockObject) {
        options.buyCondition = {
          evluPflsRt: stockObject.evlu_pfls_rt,
          buyPrice: Number(stockObject.pchs_avg_pric || 0),
        };
      }

      fetchStockDetail(stockCode, options);
    },
    refreshAnalysisData: fetch분석데이터, // 분석 데이터 새로고침 함수 전달
  });

  // 자동 매수 토글 함수
  const toggleAutoBuy = () => {
    const newState = !autoBuy;
    setAutoBuy(newState);
    toast.info(
      newState
        ? "자동 매수가 활성화되었습니다"
        : "자동 매수가 비활성화되었습니다"
    );
  };

  // 자동 매도 토글 함수
  const toggleAutoSell = () => {
    const newState = !autoSell;
    setAutoSell(newState);
    toast.info(
      newState
        ? "자동 매도가 활성화되었습니다"
        : "자동 매도가 비활성화되었습니다"
    );
  };

  return (
    <div className="space-y-2">
      {/* 헤더 및 새로고침 버튼 */}
      <Header
        selectedStockObject={selectedStock} // 객체 그대로 전달
        movePrevStock={moveToPrevStock}
        moveNextStock={moveToNextStock}
        refreshAll={refreshAll}
        isLoading={isLoading("any") || isLoadingAnalysis}
        activeTab={activeTab}
        필터링된분석데이터={필터링된분석데이터}
        체결데이터={체결데이터}
        구매데이터={구매데이터}
        autoBuy={autoBuy} // 자동 매수 상태 전달
        autoSell={autoSell}
        onToggleAutoBuy={toggleAutoBuy} // 자동 매수 토글 함수
        onToggleAutoSell={toggleAutoSell}
        onRefreshDetail={() => {
          // selectedStock이 있을 때만 상세 정보 새로고침
          if (selectedStock) {
            // 코드 추출
            const stockCode =
              selectedStock.name ||
              selectedStock.code ||
              selectedStock.ovrs_pdno ||
              selectedStock.pdno;

            // 상세 정보 조회 옵션
            const options = {
              activeTab,
              autoBuy,
              autoSell,
              onBuy: buyStock,
              onSell: sellStock,
              stockObject: selectedStock,
              체결데이터,
            };

            if (activeTab === "구매") {
              options.buyCondition = {
                evluPflsRt: selectedStock.evlu_pfls_rt,
                buyPrice: Number(selectedStock.pchs_avg_pric || 0),
              };
            }

            fetchStockDetail(stockCode, options);
          }
        }}
        onBuyCurrentStock={() => {
          // 수동으로 현재 선택된 종목 매수
          if (selectedStock && detailData) {
            // 종목 코드 추출 및 유효성 검증
            let stockCode =
              selectedStock.name ||
              selectedStock.code ||
              selectedStock.ovrs_pdno ||
              selectedStock.pdno;

            if (
              !stockCode ||
              typeof stockCode !== "string" ||
              !stockCode.trim()
            ) {
              toast.error("유효한 종목코드가 없습니다");
              return;
            }

            const isPending = 체결데이터.some((order) => {
              const orderCode = order.name || order.pdno;
              return orderCode === stockCode;
            });

            if (isPending) {
              toast.warning("해당 종목은 현재 체결 중입니다");
              return;
            }

            // 보유 종목에서는 수익률이 -10% 이하일 때만 매수 가능
            if (activeTab === "구매") {
              const profitRate = parseFloat(selectedStock.evlu_pfls_rt);
              if (!isNaN(profitRate) && profitRate > -10) {
                toast.warning(
                  "보유 종목은 손실률이 -10% 미만일 때만 매수 가능합니다"
                );
                return;
              }
            }

            buyStock(stockCode.trim(), detailData);
          } else {
            toast.warning(
              "매수할 종목이 선택되지 않았거나 상세 정보가 없습니다"
            );
          }
        }}
        onSellCurrentStock={() => {
          // 수동으로 현재 선택된 종목 매도 (보유 종목 탭에서만 가능)
          if (activeTab !== "구매") {
            toast.warning("보유 종목 탭에서만 매도가 가능합니다");
            return;
          }

          if (selectedStock && detailData) {
            let stockCode =
              selectedStock.name ||
              selectedStock.code ||
              selectedStock.ovrs_pdno ||
              selectedStock.pdno;

            if (
              !stockCode ||
              typeof stockCode !== "string" ||
              !stockCode.trim()
            ) {
              toast.error("유효한 종목코드가 없습니다");
              return;
            }

            // 체결 중인지 확인
            const isPending = 체결데이터.some((order) => {
              const orderCode = order.name || order.pdno;
              return orderCode === stockCode;
            });

            if (isPending) {
              toast.warning("해당 종목은 현재 체결 중입니다");
              return;
            }

            // 보유 수량 확인
            const quantity = selectedStock.ord_psbl_qty
              ? parseInt(selectedStock.ord_psbl_qty)
              : 0;

            if (quantity <= 0) {
              toast.warning("매도할 수 있는 수량이 없습니다");
              return;
            }

            // 평균 매수가 전달
            const avgPrice = selectedStock.pchs_avg_pric || 0;

            sellStock(stockCode.trim(), detailData, quantity, avgPrice);
          } else {
            toast.info("매도할 종목이 선택되지 않았거나 상세 정보가 없습니다");
          }
        }}
      />

      {/* 탭 */}
      <Tabs defaultValue="분석" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="분석" className="relative">
            분석
            {필터링된분석데이터.length > 0 && (
              <Badge className="ml-1.5 px-1 min-w-[20px] h-5 flex items-center justify-center">
                {필터링된분석데이터.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="체결" className="relative">
            미체결
            {체결데이터.length > 0 && (
              <Badge className="ml-1.5 px-1 min-w-[20px] h-5 flex items-center justify-center">
                {체결데이터.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="구매" className="relative">
            보유
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
          fetchStockDetail={(stockCode) =>
            fetchStockDetail(stockCode, {
              activeTab: "분석",
              autoBuy,
              onBuy: buyStock,
              체결데이터,
            })
          }
          detailLoading={detailLoading || buying || selling}
        />

        <OrderTab
          data={체결데이터}
          isLoading={isLoading("체결")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch체결데이터}
          fetchStockDetail={(stockCode) =>
            fetchStockDetail(stockCode, {
              activeTab: "체결",
              autoBuy,
              onBuy: buyStock,
            })
          }
          detailLoading={detailLoading || buying}
        />

        <PortfolioTab
          data={구매데이터}
          isLoading={isLoading("구매")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch구매데이터}
          fetchStockDetail={(stockCode) => {
            // 보유종목 탭이면 선택된 종목에서 정보 추출
            const stockItem = 구매데이터.find(
              (item) => (item.name || item.ovrs_pdno || item.pdno) === stockCode
            );

            if (stockItem) {
              fetchStockDetail(stockCode, {
                activeTab: "구매",
                autoBuy,
                autoSell,
                onBuy: buyStock,
                onSell: sellStock,
                buyCondition: {
                  evluPflsRt: stockItem.evlu_pfls_rt,
                  buyPrice: Number(stockItem.pchs_avg_pric || 0),
                },
                stockObject: stockItem,
                체결데이터,
              });
            } else {
              fetchStockDetail(stockCode, {
                activeTab: "구매",
                autoBuy,
                autoSell,
                onBuy: buyStock,
                onSell: sellStock,
                체결데이터,
              });
            }
          }}
          detailLoading={detailLoading || buying || selling}
          체결데이터={체결데이터}
        />
      </Tabs>
    </div>
  );
};

export default Log;

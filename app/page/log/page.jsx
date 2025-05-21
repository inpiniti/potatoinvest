"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import useStockData from "./hooks/useStockData";
import useStockNav from "./hooks/useStockNav";
import useStockDetail from "./hooks/useStockDetail";
import useStockBuy from "./hooks/useStockBuy"; // 새로 추가한 매수 훅
import useStockSell from "./hooks/useStockSell"; // 매도 훅 추가

// 컴포넌트 임포트
import Header from "./components/Header";

import { toast } from "sonner";

import AnalysisTab from "./components/tabPanel/AnalysisTab";
import OrderTab from "./components/tabPanel/OrderTab";
import PortfolioTab from "./components/tabPanel/PortfolioTab";

import StockNavigation from "./components/header/navigation/StockNavigation";
import AutoPlayToggle from "./components/header/navigation/AutoPlayToggle";
import BuyToggle from "./components/header/navigation/BuyToggle";
import SellToggle from "./components/header/navigation/SellToggle";
import SettingsButton from "./components/header/buttons/SettingsButton";
import LeftButton from "./components/header/buttons/LeftButton";
import RightButton from "./components/header/buttons/RightButton";
import StockDisplay from "./components/header/navigation/StockDisplay";
import Tab from "./components/header/tab/Tab";

const Log = () => {
  const [activeTab, setActiveTab] = useState("분석");
  const activeTabRef = useRef(activeTab); // useRef로 activeTab 복사

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    activeTabRef.current = newTab; // useRef를 즉시 업데이트
  };

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

  const handleStockChange = useCallback(
    (stockCode, stockObject) => {
      console.log("현재 탭 (useRef):", activeTabRef.current); // 항상 최신 값
      console.log("현재 탭 (useState):", activeTab); // 비동기적으로 업데이트된 값
      console.log("종목 변경:", stockCode, stockObject);

      const options = {
        activeTab: activeTabRef.current,
        autoBuy,
        autoSell,
        onBuy: buyStock,
        onSell: sellStock,
        stockObject,
        체결데이터,
      };

      if (activeTabRef.current === "구매" && stockObject) {
        options.buyCondition = {
          evluPflsRt: stockObject.evlu_pfls_rt,
          buyPrice: Number(stockObject.pchs_avg_pric || 0),
        };
      }

      fetchStockDetail(stockCode, options);
    },
    [
      activeTabRef,
      autoBuy,
      autoSell,
      buyStock,
      sellStock,
      체결데이터,
      fetchStockDetail,
    ]
  );

  // 종목 탐색 관련 훅 사용
  const {
    selectedStock,
    setSelectedStock,
    moveToNextStock,
    moveToPrevStock,
    isLoadingAnalysis,

    // 자동 순환 관련 추가
    autoPlay,
    toggleAutoPlay,
    hasData,
  } = useStockNav({
    activeTab,
    setActiveTab: handleTabChange,
    필터링된분석데이터,
    체결데이터,
    구매데이터,
    onStockChange: handleStockChange,
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
      <Header>
        <StockNavigation>
          <LeftButton onClick={moveToPrevStock} />
          <StockDisplay
            selectedStockObject={selectedStock}
            activeTab={activeTab}
          />
          <RightButton onClick={moveToNextStock} />
        </StockNavigation>
        <SettingsButton>
          <AutoPlayToggle autoPlay={autoPlay} toggleAutoPlay={toggleAutoPlay} />
          <BuyToggle autoBuy={autoBuy} onToggleAutoBuy={toggleAutoBuy} />
          <SellToggle autoSell={autoSell} onToggleAutoSell={toggleAutoSell} />
        </SettingsButton>
      </Header>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <Tab title="분석" value="분석" dataList={필터링된분석데이터} />
          <Tab title="미체결" value="체결" dataList={체결데이터} />
          <Tab title="보유" value="구매" dataList={구매데이터} />
        </TabsList>

        {/* 각 탭 내용 */}
        <AnalysisTab
          data={필터링된분석데이터}
          isLoading={isLoading("분석")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch분석데이터}
          // fetchStockDetail={(stockCode) =>
          //   fetchStockDetail(stockCode, {
          //     activeTab: '분석',
          //     autoBuy,
          //     onBuy: buyStock,
          //     체결데이터,
          //   })
          // }
          detailLoading={detailLoading || buying || selling}
        />

        <OrderTab
          data={체결데이터}
          isLoading={isLoading("체결")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch체결데이터}
          // fetchStockDetail={(stockCode) =>
          //   fetchStockDetail(stockCode, {
          //     activeTab: "체결",
          //     autoBuy,
          //     onBuy: buyStock,
          //   })
          // }
          detailLoading={detailLoading || buying}
        />

        <PortfolioTab
          data={구매데이터}
          isLoading={isLoading("구매")}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          onRefresh={fetch구매데이터}
          // fetchStockDetail={(stockCode) => {
          //   console.log('stockCode:', stockCode);
          //   // 보유종목 탭이면 선택된 종목에서 정보 추출
          //   const stockItem = 구매데이터.find(
          //     (item) => (item.name || item.ovrs_pdno || item.pdno) === stockCode
          //   );

          //   if (stockItem) {
          //     fetchStockDetail(stockCode, {
          //       activeTab: "구매",
          //       autoBuy,
          //       autoSell,
          //       onBuy: buyStock,
          //       onSell: sellStock,
          //       buyCondition: {
          //         evluPflsRt: stockItem.evlu_pfls_rt,
          //         buyPrice: Number(stockItem.pchs_avg_pric || 0),
          //       },
          //       stockObject: stockItem,
          //       체결데이터,
          //     });
          //   } else {
          //     fetchStockDetail(stockCode, {
          //       activeTab: "구매",
          //       autoBuy,
          //       autoSell,
          //       onBuy: buyStock,
          //       onSell: sellStock,
          //       체결데이터,
          //     });
          //   }
          // }}
          detailLoading={detailLoading || buying || selling}
          체결데이터={체결데이터}
        />
      </Tabs>
    </div>
  );
};

export default Log;

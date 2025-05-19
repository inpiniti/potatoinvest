import { useEffect, useRef, useState } from "react";

import NavigationHeader from "./header/NavigationHeader";
import StockNavigation from "./header/navigation/StockNavigation";
import AutoPlayToggle from "./header/navigation/AutoPlayToggle";
import BuyToggle from "./header/navigation/BuyToggle";
import SellToggle from "./header/navigation/SellToggle";

import ActionButtons from "./header/ActionButtons";
import BuyButton from "./header/buttons/BuyButton";
import SellButton from "./header/buttons/SellButton";

const Header = ({
  selectedStockObject,
  movePrevStock,
  moveNextStock,
  //refreshAll,
  isLoading,
  activeTab,
  //필터링된분석데이터,
  //체결데이터,
  //구매데이터,
  //onRefreshDetail,
  autoBuy,
  onToggleAutoBuy,
  autoSell,
  onToggleAutoSell,
  onBuyCurrentStock,
  onSellCurrentStock,

  // 자동 순환 관련 props
  autoPlay,
  toggleAutoPlay,
  hasData,
}) => {
  // 종목명 추출 함수
  const getStockDisplayName = () => {
    if (!selectedStockObject) return null;

    return (
      selectedStockObject.name ||
      selectedStockObject.code ||
      selectedStockObject.ovrs_pdno ||
      selectedStockObject.pdno ||
      ""
    );
  };

  // 현재 종목 표시용 - 객체 또는 코드 사용
  const currentStockDisplay = getStockDisplayName();

  // 현재 종목이 보유 종목인지 확인
  const isPortfolioStock = activeTab === "구매";

  return (
    <div className="space-y-2">
      {/* 상단 네비게이션 헤더 */}
      <NavigationHeader>
        <StockNavigation
          currentStockDisplay={currentStockDisplay}
          selectedStockObject={selectedStockObject}
          movePrevStock={movePrevStock}
          moveNextStock={moveNextStock}
          hasData={hasData}
          isLoading={isLoading}
          autoPlay={autoPlay}
          activeTab={activeTab}
        />
        <div className="flex items-center gap-2">
          <AutoPlayToggle
            autoPlay={autoPlay}
            toggleAutoPlay={toggleAutoPlay}
            hasData={hasData}
            isLoading={isLoading}
          />
          <BuyToggle
            autoBuy={autoBuy}
            onToggleAutoBuy={onToggleAutoBuy}
            isLoading={isLoading}
            activeTab={activeTab}
          />
          <SellToggle
            autoSell={autoSell}
            onToggleAutoSell={onToggleAutoSell}
            isLoading={isLoading}
          />
        </div>
      </NavigationHeader>

      {/* 하단 액션 버튼 */}
      <ActionButtons>
        <BuyButton
          onClick={onBuyCurrentStock}
          disabled={isLoading || !currentStockDisplay}
        />

        {isPortfolioStock && (
          <SellButton
            onClick={onSellCurrentStock}
            disabled={isLoading || !currentStockDisplay}
          />
        )}
      </ActionButtons>
    </div>
  );
};

export default Header;

import { useEffect, useRef, useState } from "react";

import NavigationHeader from "./header/NavigationHeader";
import StockNavigation from "./header/navigation/StockNavigation";
import AutoPlayToggle from "./header/navigation/AutoPlayToggle";
import BuyToggle from "./header/navigation/BuyToggle";
import SellToggle from "./header/navigation/SellToggle";

import ActionButtons from "./header/ActionButtons";
import BuyButton from "./header/buttons/BuyButton";
import SellButton from "./header/buttons/SellButton";
import DetailRefreshButton from "./header/buttons/DetailRefreshButton";
import RefreshAllButton from "./header/buttons/RefreshAllButton";

const Header = ({
  selectedStockObject,
  movePrevStock,
  moveNextStock,
  refreshAll,
  isLoading,
  activeTab,
  필터링된분석데이터,
  체결데이터,
  구매데이터,
  onRefreshDetail,
  autoBuy,
  onToggleAutoBuy,
  autoSell,
  onToggleAutoSell,
  onBuyCurrentStock,
  onSellCurrentStock,
}) => {
  // 자동 순환 상태 관리
  const [autoPlay, setAutoPlay] = useState(false);
  const [interval, setInterval] = useState(3000); // 기본 3초
  const autoPlayTimerRef = useRef(null);

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

  // 현재 탭에 데이터가 있는지 확인
  const hasData =
    (activeTab === "분석" && 필터링된분석데이터.length > 0) ||
    (activeTab === "체결" && 체결데이터.length > 0) ||
    (activeTab === "구매" && 구매데이터.length > 0);

  // 현재 종목 표시용 - 객체 또는 코드 사용
  const currentStockDisplay = getStockDisplayName();

  // 자동 순환 토글 함수
  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  // 자동 순환 효과
  useEffect(() => {
    if (autoPlay && hasData && !isLoading) {
      autoPlayTimerRef.current = setTimeout(() => {
        moveNextStock();
      }, interval);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, hasData, isLoading, moveNextStock, interval]);

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

        <DetailRefreshButton
          onClick={onRefreshDetail}
          disabled={isLoading || !currentStockDisplay}
        />

        <RefreshAllButton
          onClick={refreshAll}
          disabled={isLoading}
          isLoading={isLoading}
        />
      </ActionButtons>
    </div>
  );
};

export default Header;

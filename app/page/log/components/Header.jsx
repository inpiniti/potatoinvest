import { useEffect, useRef, useState } from "react";
import NavigationHeader from "./header/NavigationHeader";
import ActionButtons from "./header/ActionButtons";

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
      <NavigationHeader
        selectedStockObject={selectedStockObject}
        currentStockDisplay={currentStockDisplay}
        movePrevStock={movePrevStock}
        moveNextStock={moveNextStock}
        autoPlay={autoPlay}
        toggleAutoPlay={toggleAutoPlay}
        hasData={hasData}
        isLoading={isLoading}
        activeTab={activeTab}
        autoBuy={autoBuy}
        onToggleAutoBuy={onToggleAutoBuy}
        autoSell={autoSell}
        onToggleAutoSell={onToggleAutoSell}
        isPortfolioStock={isPortfolioStock}
      />

      {/* 하단 액션 버튼 */}
      <ActionButtons
        currentStockDisplay={currentStockDisplay}
        isLoading={isLoading}
        onBuyCurrentStock={onBuyCurrentStock}
        onSellCurrentStock={onSellCurrentStock}
        isPortfolioStock={isPortfolioStock}
        onRefreshDetail={onRefreshDetail}
        refreshAll={refreshAll}
      />
    </div>
  );
};

export default Header;

import NavigationHeader from "./header/NavigationHeader";
import StockNavigation from "./header/navigation/StockNavigation";
import AutoPlayToggle from "./header/navigation/AutoPlayToggle";
import BuyToggle from "./header/navigation/BuyToggle";
import SellToggle from "./header/navigation/SellToggle";

import SettingsButton from "./header/buttons/SettingsButton";

const Header = ({
  selectedStockObject,
  movePrevStock,
  moveNextStock,
  isLoading,
  activeTab,
  autoBuy,
  onToggleAutoBuy,
  autoSell,
  onToggleAutoSell,

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
          <SettingsButton>
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
          </SettingsButton>
        </div>
      </NavigationHeader>
    </div>
  );
};

export default Header;

"use client";

import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import PageWrap from "./components/PageWrap";
import Header from "./components/Header";
import { EmptyMessage, Loading } from "./components/TabPanel";
import StockIcon, { IconWrap } from "./components/StockIcon";

import StockNavigation from "./components/header/navigation/StockNavigation";
import AutoPlayToggle from "./components/header/navigation/AutoPlayToggle";
import BuyToggle from "./components/header/navigation/BuyToggle";
import SellToggle from "./components/header/navigation/SellToggle";
import SettingsButton from "./components/header/buttons/SettingsButton";
import LeftButton from "./components/header/buttons/LeftButton";
import RightButton from "./components/header/buttons/RightButton";
import MarketToggleButton from "./components/header/buttons/MarketToggleButton";
import StockDisplay from "./components/header/navigation/StockDisplay";
import Tab from "./components/header/tab/Tab";
import {
  MarketIndicatorCard,
  MarketIndicatorItem,
} from "./components/MarketIndicator";

import useStockData from "./hooks/useStockData";
import useStockNav from "./hooks/useStockNav";
import useStockDetail from "./hooks/useStockDetail";
import useStockBuy from "./hooks/useStockBuy";
import useStockSell from "./hooks/useStockSell";
import useTab from "./hooks/useTab";
import useToggle from "./hooks/useToggle";
import useMarketIndicators from "./hooks/useMarketIndicators";

const Log = () => {
  const { activeTab, activeTabRef, handleTabChange } = useTab();
  const {
    autoBuy,
    autoSell,
    autoPlay,
    showMarket,
    toggleAutoPlay,
    toggleAutoBuy,
    toggleAutoSell,
    toggleMarket,
  } = useToggle();

  // 시장 지표 데이터 가져오기
  const { indicators } = useMarketIndicators();

  // 데이터 관련 훅 사용
  const {
    체결데이터,
    구매데이터,
    필터링된분석데이터,
    isLoading,
    fetch분석데이터,
  } = useStockData();

  const { detailing } = useStockDetail();
  const { buying } = useStockBuy();
  const { selling } = useStockSell();

  // 종목 탐색 관련 훅 사용
  const { selectedStock, setSelectedStock, moveToNextStock, moveToPrevStock } =
    useStockNav({
      activeTab,
      activeTabRef,
      setActiveTab: handleTabChange,
      필터링된분석데이터,
      체결데이터,
      구매데이터,
      autoPlay,
      autoBuy,
      autoSell,
      fetch분석데이터,
    });

  return (
    <PageWrap>
      <Header>
        <StockNavigation>
          <LeftButton onClick={moveToPrevStock} />
          <StockDisplay
            selectedStockObject={selectedStock}
            activeTab={activeTab}
          />
          <RightButton onClick={moveToNextStock} />
        </StockNavigation>
        <MarketToggleButton
          showMarket={showMarket}
          toggleMarket={toggleMarket}
        />
        <SettingsButton>
          <AutoPlayToggle autoPlay={autoPlay} toggleAutoPlay={toggleAutoPlay} />
          <BuyToggle autoBuy={autoBuy} onToggleAutoBuy={toggleAutoBuy} />
          <SellToggle autoSell={autoSell} onToggleAutoSell={toggleAutoSell} />
        </SettingsButton>
      </Header>

      {/* 시장 지표 카드 추가 */}
      <MarketIndicatorCard isShow={showMarket}>
        {indicators.map((indicator, index) => (
          <MarketIndicatorItem
            key={index}
            region={indicator.region}
            type={indicator.type}
            value={indicator.value}
            change={indicator.change}
          />
        ))}
      </MarketIndicatorCard>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <Tab title="분석" value="분석" length={필터링된분석데이터.length} />
          <Tab title="미체결" value="체결" length={체결데이터.length} />
          <Tab title="보유" value="구매" length={구매데이터.length} />
        </TabsList>
        <TabsContent value="분석">
          <Card>
            <Loading
              isShow={isLoading("분석")}
              loadingMessage="분석 데이터를 불러오는 중입니다..."
            />
            <IconWrap isShow={!isLoading("분석")}>
              {필터링된분석데이터.map((item, idx) => (
                <StockIcon
                  item={item}
                  key={idx}
                  selectedStock={selectedStock}
                  onSelect={setSelectedStock}
                  loading={detailing || buying}
                />
              ))}
            </IconWrap>
            <EmptyMessage
              isShow={!isLoading("분석") && 필터링된분석데이터.length === 0}
              emptyMessage="현재 분석 데이터가 없습니다."
            />
          </Card>
        </TabsContent>

        <TabsContent value="체결">
          <Card>
            <Loading
              isShow={isLoading("체결")}
              loadingMessage="미체결 데이터를 불러오는 중입니다..."
            />
            <IconWrap isShow={!isLoading("체결")}>
              {체결데이터.map((item, idx) => (
                <StockIcon
                  item={item}
                  key={idx}
                  selectedStock={selectedStock}
                  onSelect={setSelectedStock}
                  loading={detailing}
                />
              ))}
            </IconWrap>
            <EmptyMessage
              isShow={!isLoading("체결") && 체결데이터.length === 0}
              emptyMessage="현재 미체결 데이터가 없습니다."
            />
          </Card>
        </TabsContent>

        <TabsContent value="구매">
          <Card>
            <Loading
              isShow={isLoading("구매")}
              loadingMessage="보유 종목 정보를 불러오는 중입니다..."
            />
            <IconWrap isShow={!isLoading("구매")}>
              {구매데이터.map((item, idx) => (
                <StockIcon
                  item={item}
                  key={idx}
                  selectedStock={selectedStock}
                  onSelect={setSelectedStock}
                  loading={detailing || buying || selling}
                  체결데이터={체결데이터}
                />
              ))}
            </IconWrap>
            <EmptyMessage
              isShow={!isLoading("구매") && 구매데이터.length === 0}
              emptyMessage="현재 보유 종목이 없습니다."
            />
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrap>
  );
};

export default Log;

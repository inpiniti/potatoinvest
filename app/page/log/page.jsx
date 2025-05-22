'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import useStockData from './hooks/useStockData';
import useStockNav from './hooks/useStockNav';
import useStockDetail from './hooks/useStockDetail';
import useStockBuy from './hooks/useStockBuy'; // 새로 추가한 매수 훅
import useStockSell from './hooks/useStockSell'; // 매도 훅 추가

// 컴포넌트 임포트
import Header from './components/Header';

import { toast } from 'sonner';

import AnalysisTab from './components/tabPanel/AnalysisTab';
import OrderTab from './components/tabPanel/OrderTab';
import PortfolioTab from './components/tabPanel/PortfolioTab';

import StockNavigation from './components/header/navigation/StockNavigation';
import AutoPlayToggle from './components/header/navigation/AutoPlayToggle';
import BuyToggle from './components/header/navigation/BuyToggle';
import SellToggle from './components/header/navigation/SellToggle';
import SettingsButton from './components/header/buttons/SettingsButton';
import LeftButton from './components/header/buttons/LeftButton';
import RightButton from './components/header/buttons/RightButton';
import StockDisplay from './components/header/navigation/StockDisplay';
import Tab from './components/header/tab/Tab';
import { EmptyMessage, Loading } from './components/TabPanel';
import { IconWrap } from './components/StockIcon';

const Log = () => {
  const [activeTab, setActiveTab] = useState('분석');
  const activeTabRef = useRef(activeTab); // useRef로 activeTab 복사

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    activeTabRef.current = newTab; // useRef를 즉시 업데이트
  };

  const [autoBuy, setAutoBuy] = useState(false); // 자동 매수 활성화 여부
  const [autoSell, setAutoSell] = useState(false); // 자동 매도 활성화 여부 추가

  // 데이터 관련 훅 사용
  const { 체결데이터, 구매데이터, 필터링된분석데이터, isLoading } =
    useStockData();

  // 상세 정보 조회 훅
  const { loading: detailLoading, fetchStockDetail } = useStockDetail();

  // 매수 훅
  const { buying, buyStock } = useStockBuy();

  // 매도 훅
  const { selling, sellStock } = useStockSell();

  const handleStockChange = useCallback(
    (stockCode, stockObject) => {
      console.log('현재 탭 (useRef):', activeTabRef.current); // 항상 최신 값
      console.log('현재 탭 (useState):', activeTab); // 비동기적으로 업데이트된 값
      console.log('종목 변경:', stockCode, stockObject);

      const options = {
        activeTab: activeTabRef.current,
        autoBuy,
        autoSell,
        onBuy: buyStock,
        onSell: sellStock,
        stockObject,
        체결데이터,
      };

      if (activeTabRef.current === '구매' && stockObject) {
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

    // 자동 순환 관련 추가
    autoPlay,
    toggleAutoPlay,
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
        ? '자동 매수가 활성화되었습니다'
        : '자동 매수가 비활성화되었습니다'
    );
  };

  // 자동 매도 토글 함수
  const toggleAutoSell = () => {
    const newState = !autoSell;
    setAutoSell(newState);
    toast.info(
      newState
        ? '자동 매도가 활성화되었습니다'
        : '자동 매도가 비활성화되었습니다'
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
          <Tab title="분석" value="분석" length={필터링된분석데이터.length} />
          <Tab title="미체결" value="체결" length={체결데이터.length} />
          <Tab title="보유" value="구매" length={구매데이터.length} />
        </TabsList>
        <TabContent value="분석">
          <Card>
            <Loading
              isShow={isLoading('분석')}
              loadingMessage="분석 데이터를 불러오는 중입니다..."
            />
            <IconWrap isShow={!isLoading('분석')}>
              {필터링된분석데이터.map((item, idx) => (
                <StockIcon
                  item={item}
                  key={idx}
                  selectedStock={selectedStock}
                  onSelect={setSelectedStock}
                  loading={detailLoading || buying}
                />
              ))}
            </IconWrap>
            <EmptyMessage
              isShow={!isLoading('분석') && 필터링된분석데이터.length === 0}
              emptyMessage="현재 분석 데이터가 없습니다."
            />
          </Card>
        </TabContent>

        <TabContent value="체결">
          <Card>
            <Loading
              isShow={isLoading('체결')}
              loadingMessage="미체결 데이터를 불러오는 중입니다..."
            />
            <IconWrap isShow={!isLoading('체결')}>
              {체결데이터.map((item, idx) => (
                <StockIcon
                  item={item}
                  key={idx}
                  selectedStock={selectedStock}
                  onSelect={setSelectedStock}
                  loading={detailLoading}
                />
              ))}
            </IconWrap>
            <EmptyMessage
              isShow={!isLoading('체결') && 체결데이터.length === 0}
              emptyMessage="현재 미체결 데이터가 없습니다."
            />
          </Card>
        </TabContent>

        <TabContent value="구매">
          <Card>
            <Loading
              isShow={isLoading('구매')}
              loadingMessage="보유 종목 정보를 불러오는 중입니다..."
            />
            <IconWrap isShow={!isLoading('구매')}>
              {구매데이터.map((item, idx) => (
                <StockIcon
                  item={item}
                  key={idx}
                  selectedStock={selectedStock}
                  onSelect={setSelectedStock}
                  loading={detailLoading || buying || selling}
                  체결데이터={체결데이터}
                />
              ))}
            </IconWrap>
            <EmptyMessage
              isShow={!isLoading('구매') && 구매데이터.length === 0}
              emptyMessage="현재 보유 종목이 없습니다."
            />
          </Card>
        </TabContent>
      </Tabs>
    </div>
  );
};

export default Log;

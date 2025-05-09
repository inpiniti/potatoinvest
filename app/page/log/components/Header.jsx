import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  onSellCurrentStock, // 매도 함수 추가
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
      ''
    );
  };

  // 현재 탭에 데이터가 있는지 확인
  const hasData =
    (activeTab === '분석' && 필터링된분석데이터.length > 0) ||
    (activeTab === '체결' && 체결데이터.length > 0) ||
    (activeTab === '구매' && 구매데이터.length > 0);

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
  const isPortfolioStock = activeTab === '구매';

  return (
    <div className="space-y-2">
      {/* 상단 헤더 영역 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-md">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={movePrevStock}
            disabled={!hasData || isLoading || autoPlay}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {currentStockDisplay ? (
            <div className="font-medium flex items-center gap-2">
              {currentStockDisplay}

              {/* 보유종목인 경우 변동율 표시 */}
              {activeTab === '구매' && selectedStockObject?.evlu_pfls_rt && (
                <span
                  className={`text-sm ${
                    parseFloat(selectedStockObject.evlu_pfls_rt) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  ({selectedStockObject.evlu_pfls_rt})
                </span>
              )}
            </div>
          ) : (
            <div className="font-medium">미선택</div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={moveNextStock}
            disabled={!hasData || isLoading || autoPlay}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* 자동 순환 컨트롤 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 mr-2">
                  <Switch
                    id="auto-play"
                    checked={autoPlay}
                    onCheckedChange={toggleAutoPlay}
                    disabled={!hasData || isLoading}
                  />
                  <Label htmlFor="auto-play" className="text-xs">
                    auto
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>3초마다 자동으로 다음 종목으로 이동합니다</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 자동 매수 컨트롤 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 mr-2">
                  <Switch
                    id="auto-buy"
                    checked={autoBuy}
                    onCheckedChange={onToggleAutoBuy}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="auto-buy"
                    className="text-xs flex items-center"
                  >
                    buy
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {activeTab === '구매'
                    ? '손실률 -10% 이하 보유 종목 자동 추가 매수'
                    : '선택된 종목 자동 매수'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 자동 매도 컨트롤 - 보유 종목 탭에서만 표시 */}
          {isPortfolioStock && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 mr-2">
                    <Switch
                      id="auto-sell"
                      checked={autoSell}
                      onCheckedChange={onToggleAutoSell}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="auto-sell"
                      className="text-xs flex items-center"
                    >
                      sell
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>수익률 2% 이상인 보유 종목 자동 매도</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border rounded-md">
        {/* 수동 매수 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBuyCurrentStock}
          disabled={isLoading || !currentStockDisplay}
          className="mr-1"
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          매수
        </Button>

        {/* 매도 버튼 - 보유 종목 탭에서만 표시 */}
        {isPortfolioStock && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSellCurrentStock}
            disabled={isLoading || !currentStockDisplay}
            className="mr-1"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            매도
          </Button>
        )}

        {/* 상세 정보 새로고침 버튼 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshDetail}
          disabled={isLoading || !currentStockDisplay}
          className="mr-1"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshAll}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          새로고침
        </Button>
      </div>
    </div>
  );
};

export default Header;

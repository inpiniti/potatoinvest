import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight } from "lucide-react";

const NavigationHeader = ({
  selectedStockObject,
  currentStockDisplay,
  movePrevStock,
  moveNextStock,
  autoPlay,
  toggleAutoPlay,
  hasData,
  isLoading,
  activeTab,
  autoBuy,
  onToggleAutoBuy,
  autoSell,
  onToggleAutoSell,
  isPortfolioStock,
}) => {
  return (
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
            {activeTab === "구매" && selectedStockObject?.evlu_pfls_rt && (
              <span
                className={`text-sm ${
                  parseFloat(selectedStockObject.evlu_pfls_rt) >= 0
                    ? "text-green-600"
                    : "text-red-600"
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
                <Label htmlFor="auto-buy" className="text-xs flex items-center">
                  buy
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {activeTab === "구매"
                  ? "손실률 -10% 이하 보유 종목 자동 추가 매수"
                  : "선택된 종목 자동 매수"}
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
  );
};

export default NavigationHeader;

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const StockNavigation = ({
  currentStockDisplay,
  selectedStockObject,
  movePrevStock,
  moveNextStock,
  hasData,
  isLoading,
  autoPlay,
  activeTab,
}) => {
  return (
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
  );
};

export default StockNavigation;
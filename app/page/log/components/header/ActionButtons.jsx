import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ShoppingCart, TrendingDown } from "lucide-react";

const ActionButtons = ({
  currentStockDisplay,
  isLoading,
  onBuyCurrentStock,
  onSellCurrentStock,
  isPortfolioStock,
  onRefreshDetail,
  refreshAll,
}) => {
  return (
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

      {/* 전체 새로고침 버튼 */}
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
  );
};

export default ActionButtons;

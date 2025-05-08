import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StockIcon from "./StockIcon";

const TabPanel = ({
  value,
  data,
  isLoading,
  onRefresh,
  title,
  description,
  loadingMessage,
  emptyMessage,
  selectedStock,
  setSelectedStock,
  fetchStockDetail,
  detailLoading,
  체결데이터, // 체결 데이터를 props로 받음
  isRefreshing, // 새로운 prop 추가
}) => {
  return (
    <TabsContent value={value} className="mt-4">
      <Card className={isRefreshing ? "animate-pulse" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold">{title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-2 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                "갱신"
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                <p className="text-gray-500">{loadingMessage}</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-start">
              {data.map((item) => (
                <StockIcon
                  key={
                    item.name ||
                    item.code ||
                    item.ovrs_pdno ||
                    item.pdno ||
                    Math.random()
                  }
                  item={item}
                  selectedStock={selectedStock} // 이제 객체가 전달됨
                  onSelect={setSelectedStock}
                  fetchDetail={fetchStockDetail}
                  loading={detailLoading}
                  체결데이터={value === "구매" ? 체결데이터 : null} // 보유 종목 탭에서만 체결데이터 전달
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default TabPanel;

"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import usePortfolio from "@/hooks/usePortfolio";

export default function StockListSection() {
  const {
    stocks,
    selectedStock,
    selectedInvestorDetail,
    selectStock,
    isLoading,
    error,
  } = usePortfolio();

  // 자산가가 선택되었으면 자산가명을 타이틀에 표시
  const title = selectedInvestorDetail
    ? `${selectedInvestorDetail.name} 종목`
    : "종목 리스트";

  return (
    <Card className="h-[calc(32rem+1rem)] flex flex-col row-span-2">
      {/* h-[calc(32rem+1rem)] = (h-64 * 2) + gap-4 = 세로 2칸 높이 */}
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          {selectedInvestorDetail
            ? `${selectedInvestorDetail.name}의 보유 종목`
            : selectedStock
            ? "선택된 종목을 보유한 자산가가 표시됩니다"
            : `총 ${stocks.length}개 종목`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-sm text-destructive">
            데이터를 불러오지 못했습니다
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            종목 데이터가 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {stocks.map((stock) => {
              const isSelected = selectedStock === stock.stock;
              const personCount =
                stock.person_count ?? stock.person?.length ?? 0;

              // 자산가가 선택되었을 때는 ratio 표시 (portfolio 기반)
              const showRatio = selectedInvestorDetail && stock.ratio;

              return (
                <button
                  key={stock.stock}
                  onClick={() => selectStock(stock.stock)}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-all ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono shrink-0"
                        >
                          {stock.stock}
                        </Badge>
                        {showRatio && (
                          <Badge
                            variant="outline"
                            className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400"
                          >
                            {stock.ratio}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {!showRatio && (
                          <>
                            <span>보유 자산가: {personCount}명</span>
                            {stock.avg_ratio && (
                              <span className="text-blue-600 dark:text-blue-400">
                                평균: {stock.avg_ratio}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {!showRatio && stock.sum_ratio && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          합계: {stock.sum_ratio}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

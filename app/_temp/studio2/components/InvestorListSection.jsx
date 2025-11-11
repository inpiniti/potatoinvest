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

export default function InvestorListSection() {
  const {
    investors,
    selectedInvestor,
    selectedStockDetail,
    selectInvestor,
    isLoading,
    error,
  } = usePortfolio();

  // 종목이 선택되었으면 종목명을 타이틀에 표시
  const title = selectedStockDetail
    ? `${selectedStockDetail.stock} 자산가`
    : "자산가 리스트";

  return (
    <Card className="h-64 flex flex-col col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>
          {selectedStockDetail
            ? `${selectedStockDetail.stock}을(를) 보유한 자산가들`
            : selectedInvestor
            ? "선택된 자산가의 종목이 표시됩니다"
            : `총 ${investors.length}명의 자산가`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto overflow-y-hidden">
        {isLoading ? (
          <div className="flex gap-2 h-full">
            <Skeleton className="h-full w-64 shrink-0" />
            <Skeleton className="h-full w-64 shrink-0" />
            <Skeleton className="h-full w-64 shrink-0" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-sm text-destructive">
            데이터를 불러오지 못했습니다
          </div>
        ) : investors.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            자산가 데이터가 없습니다
          </div>
        ) : (
          <div className="flex gap-3 h-full pb-2">
            {investors.map((investor) => {
              const isSelected = selectedInvestor === String(investor.no);
              const portfolioCount = investor.portfolio?.length ?? 0;

              // 종목이 선택되었을 때는 ratio 표시 (person 기반)
              const showRatio = selectedStockDetail && investor.ratio;

              return (
                <button
                  key={investor.no}
                  onClick={() => selectInvestor(investor.no)}
                  className={`shrink-0 w-64 h-full text-left px-3 py-2.5 rounded-md transition-all ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/50 hover:bg-muted border-2 border-transparent"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        #{investor.no}
                      </Badge>
                      <span className="font-medium text-sm truncate">
                        {investor.name}
                      </span>
                    </div>
                    {showRatio && (
                      <div className="mb-2">
                        <Badge
                          variant="outline"
                          className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400"
                        >
                          보유 비율: {investor.ratio}
                        </Badge>
                      </div>
                    )}
                    {!showRatio && investor.totalValue && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                        {investor.totalValue}
                      </div>
                    )}
                    {!showRatio && (
                      <div className="text-xs text-muted-foreground">
                        보유 종목: {portfolioCount}개
                      </div>
                    )}

                    {/* 포트폴리오 미리보기 (상위 5개) - 종목 미선택 시에만 */}
                    {!showRatio &&
                      investor.portfolio &&
                      investor.portfolio.length > 0 && (
                        <div className="mt-auto pt-2 border-t border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">
                            주요 종목
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {investor.portfolio.slice(0, 5).map((item) => (
                              <Badge
                                key={item.code}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {item.code}
                              </Badge>
                            ))}
                            {investor.portfolio.length > 5 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                +{investor.portfolio.length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
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

"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import useAssets from "@/hooks/useAssets";

export default function HoldingsSection() {
  const { holdings, isLoading, isFetching, error, refetch } = useAssets();

  // 숫자 포맷팅 함수
  const formatNumber = (value) => {
    if (!value) return "-";
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  // 손익률 색상 결정
  const getProfitColor = (value) => {
    if (!value) return "";
    const num = Number(value);
    if (isNaN(num) || num === 0) return "";
    return num > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400";
  };

  // 손익률 Badge 색상
  const getProfitBadgeVariant = (value) => {
    if (!value) return "secondary";
    const num = Number(value);
    if (isNaN(num) || num === 0) return "secondary";
    return num > 0 ? "default" : "destructive";
  };

  return (
    <Card className="h-full row-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">보유 종목</CardTitle>
            <CardDescription className="text-xs mt-1">
              총 {holdings.length}개 종목 보유 중
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="h-8 w-8"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 overflow-auto h-[calc(32rem+1rem)]">
          {isLoading && (
            <div className="text-sm text-muted-foreground">불러오는 중...</div>
          )}

          {error && (
            <div className="text-sm text-destructive">
              {error instanceof Error ? error.message : "오류가 발생했습니다"}
            </div>
          )}

          {!isLoading && !error && holdings.length === 0 && (
            <div className="text-sm text-muted-foreground">
              보유 종목이 없습니다
            </div>
          )}

          {!isLoading &&
            !error &&
            holdings.map((stock, index) => (
              <Card
                key={index}
                className="p-3 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="space-y-2">
                  {/* 종목명 & 코드 */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        {stock.prdt_name || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stock.pdno}
                      </div>
                    </div>
                    <Badge
                      variant={getProfitBadgeVariant(stock.evlu_pfls_rt)}
                      className="text-xs"
                    >
                      {stock.evlu_pfls_rt
                        ? `${Number(stock.evlu_pfls_rt) > 0 ? "+" : ""}${Number(
                            stock.evlu_pfls_rt
                          ).toFixed(2)}%`
                        : "-"}
                    </Badge>
                  </div>

                  {/* 보유수량 & 현재가 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">보유수량</div>
                      <div className="font-medium">
                        {formatNumber(stock.hldg_qty)}주
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">현재가</div>
                      <div className="font-medium">
                        ${formatNumber(stock.prpr)}
                      </div>
                    </div>
                  </div>

                  {/* 매입가 & 평가금액 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">매입평균가</div>
                      <div className="font-medium">
                        ${formatNumber(stock.pchs_avg_pric)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">평가금액</div>
                      <div className="font-medium">
                        ${formatNumber(stock.evlu_amt)}
                      </div>
                    </div>
                  </div>

                  {/* 평가손익 */}
                  <div className="pt-1 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">평가손익</span>
                      <span
                        className={`font-semibold ${getProfitColor(
                          stock.evlu_pfls_amt
                        )}`}
                      >
                        {stock.evlu_pfls_amt
                          ? `${
                              Number(stock.evlu_pfls_amt) > 0 ? "+" : ""
                            }$${formatNumber(stock.evlu_pfls_amt)}`
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

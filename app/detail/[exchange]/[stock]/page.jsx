"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import TradingViewWidgetChart from "@/components/TradingViewWidgetChart";
import useBollingerBand from "@/hooks/useBollingerBand";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { headerStore } from "@/store/headerStore";

export default function DetailPage() {
  const params = useParams();
  const exchangeParam = params?.exchange;
  const stockParam = params?.stock;
  const stock = String(stockParam);
  const exchange = String(exchangeParam);

  const { setTitle } = headerStore();

  // 페이지 진입 시 타이틀 설정
  useEffect(() => {
    setTitle(`${exchange}:${stock}`);
    // 페이지 떠날 때 타이틀 초기화
    return () => setTitle(null);
  }, [exchange, stock, setTitle]);

  const { upper, middle, lower, currentPrice, isLoading } = useBollingerBand({
    exchange,
    symbol: stock,
    enabled: true,
  });

  return (
    <div className="h-[calc(100svh-4rem)] w-full flex flex-col">
      {/* 볼린저밴드 정보 */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          ) : (
            upper &&
            middle &&
            lower && (
              <div className="flex gap-2 items-center">
                <Badge variant="outline">
                  현재가: ${currentPrice.toFixed(2)}
                </Badge>
                <Badge variant="destructive">상한: ${upper.toFixed(2)}</Badge>
                <Badge variant="default">하한: ${lower.toFixed(2)}</Badge>
              </div>
            )
          )}
        </div>
      </div>

      {/* TradingView 차트 */}
      <div className="flex-1">
        <TradingViewWidgetChart symbol={stock} market={exchange} />
      </div>
    </div>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, TestTube } from "lucide-react";
import { useMemo } from "react";

export default function BoosterCard({
  data,
  krw = 1370,
  isPriceChanged = false,
  onTestPriceChange,
}) {
  const { symbol, realTimeData, holdingData, pchs_avg_pric } = data;

  // 등락 구분에 따른 색상 및 아이콘 결정
  const isPositive = realTimeData?.SIGN === "1" || realTimeData?.SIGN === "2"; // 상승
  const isNegative = realTimeData?.SIGN === "4" || realTimeData?.SIGN === "5"; // 하락

  const getPriceColor = () => {
    if (isPositive) return "text-red-600";
    if (isNegative) return "text-blue-600";
    return "text-gray-600";
  };

  const getPriceIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    if (isNegative) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  // 수익률 계산
  const profitRate = useMemo(() => {
    if (!realTimeData?.LAST || !pchs_avg_pric) return 0;
    const currentPrice = parseFloat(realTimeData.LAST);
    const avgPrice = parseFloat(pchs_avg_pric);
    return (((currentPrice - avgPrice) / avgPrice) * 100).toFixed(2);
  }, [realTimeData?.LAST, pchs_avg_pric]);

  const formatPrice = (value) => {
    if (!value) return "0";
    return parseFloat(value).toLocaleString();
  };

  const formatKrwPrice = (value) => {
    if (!value) return "0";
    const usdPrice = parseFloat(value);
    const krwPrice = usdPrice * krw;
    return `₩${Math.round(krwPrice).toLocaleString()}`;
  };

  if (!realTimeData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">{symbol}</CardTitle>
          <CardDescription>실시간 데이터 로딩 중...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className={`w-full hover:shadow-lg transition-all duration-500 ${
        isPriceChanged ? "ring-2 ring-red-500 bg-red-50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {holdingData?.prdt_name || symbol}
            </CardTitle>
          </div>
          <div className="flex gap-2 items-center">
            <Badge
              variant={parseFloat(profitRate) >= 0 ? "default" : "destructive"}
            >
              {parseFloat(profitRate) >= 0 ? "+" : ""}
              {profitRate}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 현재가 정보 */}
        <div className="space-y-2">
          <div
            className={`flex items-center gap-2 text-2xl font-mono ${getPriceColor()}`}
          >
            {getPriceIcon()}
            <span>${formatPrice(realTimeData.LAST)}</span>
            <div className="text-sm text-muted-foreground">
              {formatKrwPrice(realTimeData.LAST)}
            </div>
            <span className="text-sm font-mono">
              ({isPositive ? "+" : ""}
              {realTimeData.RATE}%)
            </span>
          </div>
        </div>

        {/* 매입 정보 */}
        <div className="grid grid-cols-4 text-sm border-t pt-3">
          <div>
            <div className="text-muted-foreground mb-1">평균매입가</div>
            <div className="font-mono">${formatPrice(pchs_avg_pric)}</div>
            <div className="text-xs text-muted-foreground">
              {formatKrwPrice(pchs_avg_pric)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">보유수량</div>
            <div className="font-mono">{holdingData?.ovrs_cblc_qty || 0}주</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">매수호가</div>
            <div className="font-mono text-blue-600">
              ${formatPrice(realTimeData.PBID)}
            </div>
            <div className="text-xs text-muted-foreground">
              잔량: {formatPrice(realTimeData.VBID)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">매도호가</div>
            <div className="font-mono text-red-600">
              ${formatPrice(realTimeData.PASK)}
            </div>
            <div className="text-xs text-muted-foreground">
              잔량: {formatPrice(realTimeData.VASK)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

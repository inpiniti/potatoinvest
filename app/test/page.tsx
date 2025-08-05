"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import useRealTimePrice from "@/hooks/useRealTimePrice";
import { useEffect, useRef, useState } from "react";

interface StockData {
  RSYM: string; // 실시간종목코드
  SYMB: string; // 종목코드
  ZDIV: string; // 수수점자리수
  TYMD: string; // 현지영업일자
  XYMD: string; // 현지일자
  XHMS: string; // 현지시간
  KYMD: string; // 한국일자
  KHMS: string; // 한국시간
  OPEN: string; // 시가
  HIGH: string; // 고가
  LOW: string; // 저가
  LAST: string; // 현재가
  SIGN: string; // 대비구분
  DIFF: string; // 전일대비
  RATE: string; // 등락율
  PBID: string; // 매수호가
  PASK: string; // 매도호가
  VBID: string; // 매수잔량
  VASK: string; // 매도잔량
  EVOL: string; // 체결량
  TVOL: string; // 거래량
  TAMT: string; // 거래대금
  BIVL: string; // 매도체결량
  ASVL: string; // 매수체결량
  STRN: string; // 체결강도
  MTYP: string; // 시장구분 1:장중,2:장전,3:장후
  name?: string; // 종목명 (추가)
}

export function StockCard({ stock }: { stock: StockData }) {
  const [isChanged, setIsChanged] = useState(false);
  const prevLastRef = useRef(stock.LAST);

  useEffect(() => {
    if (prevLastRef.current !== stock.LAST) {
      setIsChanged(true);
      const timer = setTimeout(() => setIsChanged(false), 1000);
      prevLastRef.current = stock.LAST;
      return () => clearTimeout(timer);
    }
    prevLastRef.current = stock.LAST;
  }, [stock.LAST]);

  // 등락 구분에 따른 색상 결정
  const isPositive = stock.SIGN === "1" || stock.SIGN === "2"; // 상승
  const isNegative = stock.SIGN === "4" || stock.SIGN === "5"; // 하락

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

  const getMarketTypeText = () => {
    switch (stock.MTYP) {
      case "1":
        return "장중";
      case "2":
        return "장전";
      case "3":
        return "장후";
      default:
        return "미정";
    }
  };

  const formatNumber = (value: string) => {
    const num = parseInt(value);
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  const formatPrice = (value: string, zdiv: string) => {
    const num = parseInt(value);
    const divider = Math.pow(10, parseInt(zdiv) || 0);
    if (isNaN(num)) return value;
    return (num / divider).toLocaleString();
  };

  const formatTime = (date: string, time: string) => {
    if (!date || !time) return "";
    const formattedDate = `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(
      4,
      6
    )}`;
    const formattedTime = `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(
      4,
      6
    )}`;
    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Card
      className={`h-full hover:shadow-lg transition-shadow w-60 ${
        isChanged ? "border-2 border-red-500" : "border"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-1 break-words">
              {stock.name || stock.SYMB}
            </CardTitle>
            <div className="text-sm text-muted-foreground">{stock.SYMB}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline">{getMarketTypeText()}</Badge>
            <div className="text-xs text-muted-foreground">
              {formatTime(stock.KYMD, stock.KHMS)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* 현재가 및 등락 정보 */}
        <div className="space-y-2">
          <div
            className={`flex items-center gap-2 text-2xl ${getPriceColor()}`}
          >
            {getPriceIcon()}
            <span className="font-mono">{stock.LAST}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${getPriceColor()}`}>
            <span className="font-mono">
              {isPositive ? "+" : ""}
              {formatPrice(stock.DIFF, stock.ZDIV)}
            </span>
            <span className="font-mono">
              ({isPositive ? "+" : ""}
              {stock.RATE}%)
            </span>
          </div>
        </div>

        {/* 시고저가 정보 */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="text-muted-foreground">시가</div>
            <div className="font-mono">
              {formatPrice(stock.OPEN, stock.ZDIV)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">고가</div>
            <div className="font-mono text-red-600">
              {formatPrice(stock.HIGH, stock.ZDIV)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">저가</div>
            <div className="font-mono text-blue-600">
              {formatPrice(stock.LOW, stock.ZDIV)}
            </div>
          </div>
        </div>

        {/* 호가 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">매수호가</div>
            <div className="font-mono text-blue-600">{stock.PBID}</div>
            <div className="text-xs text-muted-foreground">
              잔량: {formatNumber(stock.VBID)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">매도호가</div>
            <div className="font-mono text-red-600">{stock.PASK}</div>
            <div className="text-xs text-muted-foreground">
              잔량: {formatNumber(stock.VASK)}
            </div>
          </div>
        </div>

        {/* 거래 정보 */}
        <div className="space-y-2 text-sm pt-2 border-t">
          <div className="flex justify-between">
            <span className="text-muted-foreground">거래량</span>
            <span className="font-mono">{formatNumber(stock.TVOL)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">거래대금</span>
            <span className="font-mono">{formatNumber(stock.TAMT)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">체결강도</span>
            <span className="font-mono">{stock.STRN}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { data } = useRealTimePrice([
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "TSLA",
    "UPWK",
  ]);

  return (
    <div className="flex gap-4 p-4">
      {Object.values(data).map((stock) => (
        <StockCard key={(stock as StockData).SYMB} stock={stock as StockData} />
      ))}
    </div>
  );
}

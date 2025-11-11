"use client";

import TradingViewWidget from "@/components/TradingViewWidget";
import TradingViewWidgetChart from "@/components/TradingViewWidgetChart";
import TickerTab from "@/components/TickerTab";
import TechnicalAnalysis from "@/components/TechnicalAnalysis";
import CompanyProfile from "@/components/CompanyProfile";
import Fundamental from "@/components/Fundamental";

import { selectedStockStore } from "@/store/selectedStockStore";

export default function Page() {
  const { selectedStock } = selectedStockStore();
  // normalize selectedStock to derive exchange and stock codes safely
  let exchangeCode = "NASDAQ";
  let stockCode = "AAPL";
  if (selectedStock) {
    if (typeof selectedStock === "string") {
      const parts = selectedStock.split(":");
      if (parts.length === 2) {
        exchangeCode = parts[0] || exchangeCode;
        stockCode = parts[1] || stockCode;
      } else {
        stockCode = selectedStock || stockCode;
      }
    } else {
      exchangeCode = selectedStock.exchange || exchangeCode;
      stockCode = selectedStock.stock || stockCode;
    }
  }

  return (
    <div className="w-full flex flex-col">
      <TickerTab />
      <div className="w-full p-4 gap-4 flex flex-col">
        <div className="w-full flex gap-4">
          <div className="shrink-0 flex flex-col gap-4">
            <TradingViewWidget symbol={`${exchangeCode}:${stockCode}`} />
            <CompanyProfile symbol={stockCode} market={exchangeCode} />
          </div>
          <div className="w-full">
            <TradingViewWidgetChart symbol={stockCode} market={exchangeCode} />
          </div>
        </div>
        <div className="flex gap-4 h-full">
          <div className="w-full h-[918px]">
            <Fundamental symbol={stockCode} market={exchangeCode} />
          </div>
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex gap-4">
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="1m"
              />
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="5m"
              />
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="15m"
              />
            </div>
            <div className="flex gap-4">
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="30m"
              />
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="1h"
              />
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="2h"
              />
            </div>
            <div className="flex gap-4">
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="1D"
              />
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="1W"
              />
              <TechnicalAnalysis
                symbol={stockCode}
                market={exchangeCode}
                interval="1M"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

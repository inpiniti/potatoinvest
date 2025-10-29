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
  return (
    <div className="w-full flex flex-col">
      <TickerTab />
      <div className="w-full p-4 gap-4 flex flex-col">
        <div className="w-full flex gap-4">
          <div className="shrink-0 flex flex-col gap-4">
            <TradingViewWidget
              symbol={
                selectedStock
                  ? `${selectedStock.exchange}:${selectedStock.stock}`
                  : "NASDAQ:AAPL"
              }
            />
            <CompanyProfile
              symbol={selectedStock.stock || "AAPL"}
              market={selectedStock.exchange || "NASDAQ"}
            />
          </div>
          <div className="w-full">
            <TradingViewWidgetChart
              symbol={selectedStock.stock || "AAPL"}
              market={selectedStock.exchange || "NASDAQ"}
            />
          </div>
        </div>
        <div className="flex gap-4 h-full">
          <div className="w-full h-[918px]">
            <Fundamental
              symbol={selectedStock.stock || "AAPL"}
              market={selectedStock.exchange || "NASDAQ"}
            />
          </div>
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex gap-4">
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="1m"
              />
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="5m"
              />
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="15m"
              />
            </div>
            <div className="flex gap-4">
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="30m"
              />
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="1h"
              />
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="2h"
              />
            </div>
            <div className="flex gap-4">
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="1D"
              />
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="1W"
              />
              <TechnicalAnalysis
                symbol={selectedStock.stock || "AAPL"}
                market={selectedStock.exchange || "NASDAQ"}
                interval="1M"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, memo } from "react";

function TechnicalAnalysis({
  symbol = "AAPL",
  interval = "1m",
  market = "NASDAQ",
}) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;
    try {
      container.current.innerHTML = "";
    } catch (e) {
      // ignore
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "colorTheme": "light",
          "displayMode": "single",
          "isTransparent": false,
          "locale": "en",
          "interval": "${interval}",
          "disableInterval": false,
          "width": 425,
          "height": 450,
          "symbol": "${market}:${symbol}",
          "showIntervalTabs": true
        }`;
    container.current.appendChild(script);

    return () => {
      try {
        if (container.current) container.current.innerHTML = "";
      } catch (e) {
        // ignore
      }
    };
  }, [symbol, interval]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TechnicalAnalysis);

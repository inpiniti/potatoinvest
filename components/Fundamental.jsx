"use client";

import React, { useEffect, useRef, memo } from "react";

function Fundamental({ symbol = "AAPL", market = "NASDAQ" }) {
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
      "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "symbol": "${market}:${symbol}",
          "colorTheme": "light",
          "displayMode": "regular",
          "isTransparent": false,
          "locale": "kr"
        }`;
    container.current.appendChild(script);

    return () => {
      try {
        if (container.current) container.current.innerHTML = "";
      } catch (e) {
        // ignore
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(Fundamental);

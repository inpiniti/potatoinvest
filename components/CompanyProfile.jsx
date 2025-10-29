"use client";

import React, { useEffect, useRef, memo } from "react";

function CompanyProfile({ symbol = "AAPL", market = "NASDAQ" }) {
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
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "symbol": "${market}:${symbol}",
          "colorTheme": "light",
          "isTransparent": false,
          "locale": "kr",
          "width": 400,
          "height": 550
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

export default memo(CompanyProfile);

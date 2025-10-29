"use client";

import { useEffect, useRef, memo } from "react";

function TickerTab() {
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
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "symbols": [
            {
              "proName": "FOREXCOM:SPXUSD",
              "title": "S&P 500 Index"
            },
            {
              "proName": "FOREXCOM:NSXUSD",
              "title": "US 100 Cash CFD"
            },
            {
              "proName": "PEPPERSTONE:USDKRW",
              "title": "USD to KRW"
            },
            {
              "proName": "NASDAQ:QQQ",
              "title": "QQQ"
            },
            {
              "proName": "UPBIT:BTCKRW",
              "title": "Bitcoin"
            }
          ],
          "colorTheme": "light",
          "locale": "en",
          "largeChartUrl": "",
          "isTransparent": false,
          "showSymbolLogo": true,
          "displayMode": "adaptive"
        }`;
    container.current.appendChild(script);

    return () => {
      try {
        if (container.current) container.current.innerHTML = "";
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TickerTab);

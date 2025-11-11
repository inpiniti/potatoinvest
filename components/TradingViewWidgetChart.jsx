// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react";

function TradingViewWidgetChart({ symbol = "AAPL", market = "NASDAQ" }) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;
    // clear previous widget so we replace it on symbol change
    try {
      container.current.innerHTML = "";
    } catch (e) {
      // ignore
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "kr",
          "save_image": true,
          "style": "1",
          "symbol": "${market}:${symbol}",
          "theme": "light",
          "timezone": "Etc/UTC",
          "backgroundColor": "#ffffff",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [
            "STD;Bollinger_Bands"
          ],
          "autosize": true
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

export default memo(TradingViewWidgetChart);

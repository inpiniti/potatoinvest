// TradingViewWidget.jsx
import React, { useEffect, useRef, memo } from "react";

function TradingViewWidget({ symbol = "NASDAQ:AAPL" }) {
  const container = useRef(null);

  useEffect(() => {
    // clear previous widget content so changing symbol replaces the widget
    if (!container.current) return;
    try {
      container.current.innerHTML = "";
    } catch (e) {
      // ignore DOM clearing errors
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "symbol": "${symbol}",
          "colorTheme": "light",
          "isTransparent": false,
          "locale": "en"
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

export default memo(TradingViewWidget);

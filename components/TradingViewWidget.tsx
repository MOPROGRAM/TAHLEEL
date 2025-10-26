import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  ticker: string;
}

export const TradingViewWidget = memo(function TradingViewWidget({ ticker }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) {
      return;
    }

    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": ticker,
      "interval": "240",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "ar",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com"
    });

    container.current.appendChild(script);
  }, [ticker]);

  return (
    <div className="tradingview-widget-container" style={{ height: 400, width: '100%' }} ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
});

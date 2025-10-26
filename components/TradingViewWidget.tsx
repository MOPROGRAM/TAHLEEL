// FIX: Removed invalid characters from the beginning of the file.
import React, { useEffect, useRef, memo } from 'react';

// A promise to ensure the script is loaded only once
let isTradingViewScriptLoading = false;
let tradingViewScriptPromise: Promise<void> | null = null;

const loadTradingViewScript = (): Promise<void> => {
  if (tradingViewScriptPromise) {
    return tradingViewScriptPromise;
  }

  if ((window as any).TradingView) {
    return Promise.resolve();
  }
  
  if (isTradingViewScriptLoading) {
      // Wait for the existing script to load
      return new Promise((resolve) => {
          const interval = setInterval(() => {
              if ((window as any).TradingView) {
                  clearInterval(interval);
                  resolve();
              }
          }, 100);
      });
  }

  isTradingViewScriptLoading = true;
  tradingViewScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      isTradingViewScriptLoading = false;
      resolve();
    };
    document.body.appendChild(script);
  });

  return tradingViewScriptPromise;
};


interface TradingViewWidgetProps {
  ticker: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ ticker }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const createWidget = () => {
      if (!container.current || !(window as any).TradingView) return;

      // Clear any previous widget
      container.current.innerHTML = '';

      widgetRef.current = new (window as any).TradingView.widget({
        autosize: true,
        symbol: ticker,
        interval: "240", // 4-hour timeframe
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "ar_AE",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        hide_side_toolbar: true,
        studies: [
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies",
          {
              "id": "MASimple@tv-basicstudies",
              "inputs": {
                  "length": 50
              }
          }
        ],
        container_id: container.current.id,
      });
    };

    loadTradingViewScript().then(() => {
      // Ensure the component is still mounted
      if (container.current) {
        createWidget();
      }
    });

    return () => {
        // Cleanup widget on component unmount
        if (widgetRef.current && widgetRef.current.remove) {
            try {
                widgetRef.current.remove();
                widgetRef.current = null;
            } catch (e) {
                // Ignore errors on cleanup
            }
        }
    };
  }, [ticker]);

  return (
    <div className="tradingview-widget-container h-full" ref={container} id={`tradingview-widget-${ticker}-${Math.random()}`}>
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
};

export default memo(TradingViewWidget);
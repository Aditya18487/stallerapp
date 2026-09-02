import React, { useState, useEffect } from 'react';
import { generateScannerSignals } from '@/lib/signalEngine';

const TICKER_SYMBOLS = ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'NAS100', 'US30', 'GBPJPY'];

export default function TickerBar() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const update = () => {
      const signals = generateScannerSignals();
      setPrices(signals.map(s => ({
        symbol: s.symbol,
        price: s.entry,
        change: (Math.random() - 0.48) * 0.5,
        side: s.side,
      })));
    };
    update();
    const interval = setInterval(update, 15000);
    return () => clearInterval(interval);
  }, []);

  const items = [...prices, ...prices]; // duplicate for seamless loop

  return (
    <div className="bg-[hsl(222,47%,3%)] border-b border-border/40 overflow-hidden pt-[env(safe-area-inset-top)]">
      <div className="h-9 flex items-center overflow-hidden">
        {/* Live indicator */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 border-r border-border/40 h-full">
          <div className="w-1.5 h-1.5 rounded-full bg-bullish animate-live-pulse" />
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">LIVE</span>
        </div>
        
        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden">
          <div className="flex animate-ticker whitespace-nowrap">
            {items.map((item, i) => (
              <TickerItem key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TickerItem({ symbol, price, change }) {
  const isUp = change >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-4 text-[11px] font-mono">
      <span className="text-muted-foreground">{symbol}</span>
      <span className="text-foreground font-medium">{price?.toFixed(symbol === 'BTCUSD' || symbol === 'ETHUSD' ? 2 : symbol === 'XAUUSD' ? 2 : symbol === 'NAS100' || symbol === 'US30' ? 2 : 5)}</span>
      <span className={isUp ? 'text-bullish' : 'text-bearish'}>
        {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </span>
      <span className="text-border mx-1">|</span>
    </span>
  );
}
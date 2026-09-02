import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

function fmt(value, digits) {
  if (typeof value !== 'number') return '—';
  return value.toFixed(value > 1000 ? 2 : value > 10 ? (digits > 2 ? 3 : 2) : digits);
}

function formatVolume(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v;
}

export default function LivePriceTicker({ symbol, tick, meta, isLive }) {
  const up = tick.changePct >= 0;

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-2xl border border-border/60 bg-gradient-card">
      {/* Symbol + status */}
      <div className="flex items-center gap-2 mr-2">
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg text-foreground leading-none">{symbol}</span>
          <span className="text-[11px] text-muted-foreground font-mono capitalize">{meta.type}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
          isLive ? 'bg-bullish/15 text-bullish border border-bullish/30' : 'bg-secondary text-muted-foreground border border-border'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-bullish animate-live-pulse' : 'bg-muted-foreground'}`} />
          {isLive ? 'LIVE' : 'PAUSED'}
        </div>
      </div>

      {/* Bid */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] text-muted-foreground font-mono uppercase">Bid</span>
        <span className={`text-xl font-mono font-bold tabular-nums transition-colors ${up ? 'text-bullish' : 'text-bearish'}`}>
          {fmt(tick.bid, meta.digits)}
        </span>
      </div>

      {/* Ask */}
      <div className="flex flex-col items-center">
        <span className="text-[11px] text-muted-foreground font-mono uppercase">Ask</span>
        <span className="text-sm font-mono font-medium text-foreground/70 tabular-nums">
          {fmt(tick.ask, meta.digits)}
        </span>
      </div>

      {/* Change */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
        up ? 'bg-bullish/10 border-bullish/30 text-bullish' : 'bg-bearish/10 border-bearish/30 text-bearish'
      }`}>
        {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="text-sm font-mono font-bold tabular-nums">
          {up ? '+' : ''}{fmt(tick.change, meta.digits)} ({up ? '+' : ''}{tick.changePct?.toFixed(2)}%)
        </span>
      </div>

      {/* 24h range */}
      <div className="hidden sm:flex flex-col items-center">
        <span className="text-[11px] text-muted-foreground font-mono">24H Range</span>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-bearish">{fmt(tick.low24, meta.digits)}</span>
          <span className="text-muted-foreground">—</span>
          <span className="text-bullish">{fmt(tick.high24, meta.digits)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="hidden md:flex flex-col items-center">
        <span className="text-[11px] text-muted-foreground font-mono">Volume</span>
        <div className="flex items-center gap-1 text-xs font-mono text-foreground">
          <Activity className="w-3 h-3 text-primary" />
          {formatVolume(tick.volume)}
        </div>
      </div>
    </div>
  );
}
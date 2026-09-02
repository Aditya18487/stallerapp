import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, Volume2, VolumeX,
  Pause, Play, RefreshCw, Zap, Copy, Check, Share2,
} from 'lucide-react';
import { generateSignal } from '@/lib/signalEngine';
import { playHighAlertBeep, playSignalBeep } from '@/lib/audioAlarm';
import CandlestickChart from '@/components/CandlestickChart';
import LivePriceTicker from '@/components/LivePriceTicker';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';
import ChartSignalPanel from '@/components/ChartSignalPanel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import SubscriptionGate from '@/components/SubscriptionGate';
import { useSubscription } from '@/hooks/useSubscription';
import { useLiveMarket } from '@/hooks/useLiveMarket';

const SYMBOLS = ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSD', 'ETHUSD', 'NAS100', 'US30', 'GBPJPY'];

const SIDE_COLORS = {
  BUY:  { text: 'text-bullish',  bg: 'bg-bullish/10',  border: 'border-bullish/40',  icon: TrendingUp },
  SELL: { text: 'text-bearish',  bg: 'bg-bearish/10',  border: 'border-bearish/40',  icon: TrendingDown },
  WAIT: { text: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border', icon: Minus },
};

export default function ChartPage() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [signal, setSignal] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [chartSize, setChartSize] = useState({ width: 800, height: 400 });
  const [linkCopied, setLinkCopied] = useState(false);
  const [signalPanelOpen, setSignalPanelOpen] = useState(false);
  const chartContainerRef = useRef(null);
  const prevAlertRef = useRef(false);

  const { candles, tick, isLive, toggleLive, meta } = useLiveMarket(symbol);
  const { isSubscribed } = useSubscription();

  const loadSignal = useCallback(() => {
    const newSignal = generateSignal(symbol, '15min');
    setSignal(prev => {
      if (newSignal.isHighAlert && !prevAlertRef.current && soundOn) playHighAlertBeep();
      else if (prev?.side !== newSignal.side && newSignal.side !== 'WAIT' && soundOn) playSignalBeep(newSignal.side);
      prevAlertRef.current = newSignal.isHighAlert;
      return newSignal;
    });
  }, [symbol, soundOn]);

  useEffect(() => {
    loadSignal();
    const id = setInterval(loadSignal, 60000);
    return () => clearInterval(id);
  }, [loadSignal]);

  // Measure chart container and fill available height
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setChartSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    if (chartContainerRef.current) ro.observe(chartContainerRef.current);
    return () => ro.disconnect();
  }, []);

  const copyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const cfg = SIDE_COLORS[signal?.side || 'WAIT'];
  const SideIcon = cfg.icon;

  if (!isSubscribed) {
    return <SubscriptionGate pageName="Live Chart & Signals" />;
  }

  return (
    <div className="flex flex-col bg-background" style={{ height: '100dvh', overflow: 'hidden' }}>
      <TopNav />
      <MobileTopHeader title="Live Chart" />

      {/* Full remaining height split into controls + chart */}
      <div className="flex flex-col flex-1 min-h-0 px-3 pt-2 pb-2 gap-2">

        {/* ── Row 1: Symbol picker + controls ── */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex bg-secondary/50 rounded-xl border border-border/60 p-1 gap-0.5 flex-wrap">
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  symbol === s
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Share link */}
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                linkCopied ? 'border-bullish/40 bg-bullish/10 text-bullish' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
              }`}
              title="Copy platform link to share"
            >
              {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {linkCopied ? 'Copied!' : 'Share'}
            </button>

            <button
              onClick={toggleLive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isLive ? 'border-bullish/30 bg-bullish/10 text-bullish' : 'border-border bg-secondary text-muted-foreground'
              }`}
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isLive ? 'Pause' : 'Resume'}
            </button>

            <button
              onClick={() => setSoundOn(v => !v)}
              className={`p-1.5 rounded-xl border transition-all ${soundOn ? 'border-primary/30 text-primary bg-primary/10' : 'border-border text-muted-foreground bg-secondary'}`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={loadSignal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Signal
            </button>
          </div>
        </div>

        {/* ── Row 2: Ticker ── */}
        <div className="shrink-0">
          <LivePriceTicker symbol={symbol} tick={tick} meta={meta} isLive={isLive} />
        </div>

        {/* ── Row 3: HIGH-ALERT banner (only when active) ── */}
        <AnimatePresence>
          {signal?.isHighAlert && (
            <motion.div
              key="alert-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl border border-alert/40 bg-alert/10 animate-signal-glow overflow-hidden"
            >
              <Zap className="w-4 h-4 text-alert flex-shrink-0" />
              <span className="font-bold text-alert text-xs">HIGH-ALERT — Confluence {signal.confluenceScore}/6 — All conditions aligned</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Row 4: Chart panel + signal sidebar ── */}
        <div className="flex flex-1 min-h-0 gap-2">

          {/* Chart — fills all remaining height */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-2xl border border-border/60 bg-gradient-card overflow-hidden">
            {/* Chart header */}
            <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-sm text-foreground">{symbol}</span>
                <span className="text-xs font-mono text-muted-foreground">1 min · SMC</span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-bullish animate-live-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-[11px] font-mono text-muted-foreground">{isLive ? 'Live' : 'Paused'}</span>
                </div>
              </div>
              {signal && (
                <div className="flex items-center gap-1.5">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <SideIcon className="w-3 h-3" />
                    {signal.side}
                  </div>
                  <button
                    onClick={() => setSignalPanelOpen(true)}
                    className="md:hidden flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold border border-primary/30 bg-primary/10 text-primary"
                  >
                    <Zap className="w-3 h-3" />
                    Details
                  </button>
                </div>
              )}
            </div>

            {/* Chart canvas — takes all remaining height */}
            <div ref={chartContainerRef} className="flex-1 min-h-0">
              <CandlestickChart
                candles={candles}
                signal={signal}
                fib={signal?.fib}
                srLevels={signal?.srLevels}
                width={chartSize.width}
                height={chartSize.height}
              />
            </div>
          </div>

          {/* Signal sidebar — desktop only; mobile uses slide-over sheet */}
          {signal && (
            <div className="hidden md:flex w-56 shrink-0 flex-col gap-2 overflow-y-auto">
              <ChartSignalPanel signal={signal} symbol={symbol} cfg={cfg} SideIcon={SideIcon} />
            </div>
          )}
        </div>

        {/* Mobile signal slide-over sheet */}
        <Sheet open={signalPanelOpen} onOpenChange={setSignalPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-sm bg-background overflow-y-auto">
            <SheetHeader className="pr-8 mb-2">
              <SheetTitle className="text-base font-display">Signal — {symbol}</SheetTitle>
            </SheetHeader>
            {signal && (
              <div className="flex flex-col gap-2">
                <ChartSignalPanel signal={signal} symbol={symbol} cfg={cfg} SideIcon={SideIcon} />
              </div>
            )}
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}
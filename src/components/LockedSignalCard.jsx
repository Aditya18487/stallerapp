import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, TrendingUp, CreditCard } from 'lucide-react';

/**
 * Blurred/locked signal card shown to non-subscribers on the Dashboard.
 * Renders the SignalCard shape but with a paywall overlay.
 */
export default function LockedSignalCard({ signal }) {
  if (!signal) return null;
  const isBuy = signal.side === 'BUY';
  const sideColor = isBuy ? 'text-bullish' : signal.side === 'SELL' ? 'text-bearish' : 'text-muted-foreground';
  const sideBg = isBuy ? 'bg-bullish/10' : signal.side === 'SELL' ? 'bg-bearish/10' : 'bg-secondary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-border/60 bg-gradient-card overflow-hidden"
    >
      {/* Blurred content behind */}
      <div className="p-4 blur-sm pointer-events-none select-none">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${sideBg}`}>
              <TrendingUp className={`w-4 h-4 ${sideColor}`} />
            </div>
            <div>
              <div className="font-display font-bold text-foreground">{signal.symbol}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{signal.timeframe}</div>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold ${sideColor}`}>{signal.side}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {['ENTRY', 'SL', 'TP'].map(label => (
            <div key={label} className="text-center p-2 rounded-lg bg-muted/20">
              <div className="text-[9px] text-muted-foreground font-mono uppercase">{label}</div>
              <div className="text-xs font-mono font-bold text-foreground">••••••</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {signal.confluences?.slice(0, 3).map((c, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Paywall overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-[2px]">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center px-4">
          <p className="text-xs font-medium text-foreground mb-0.5">Subscribe to view signal</p>
          <p className="text-[10px] text-muted-foreground">Entry, SL & TP locked</p>
        </div>
        <Link
          to="/billing"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
        >
          <CreditCard className="w-3.5 h-3.5" />
          Unlock
        </Link>
      </div>
    </motion.div>
  );
}
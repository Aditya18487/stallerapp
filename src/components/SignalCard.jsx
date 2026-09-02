import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, Target, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';


const SIDE_CONFIG = {
  BUY: {
    icon: TrendingUp,
    label: 'BUY',
    color: 'text-bullish',
    bg: 'bg-bullish/10',
    border: 'border-bullish/30',
    glow: 'shadow-glow-bullish',
    badge: 'bg-bullish/20 text-bullish border-bullish/30',
  },
  SELL: {
    icon: TrendingDown,
    label: 'SELL',
    color: 'text-bearish',
    bg: 'bg-bearish/10',
    border: 'border-bearish/30',
    glow: 'shadow-glow-bearish',
    badge: 'bg-bearish/20 text-bearish border-bearish/30',
  },
  WAIT: {
    icon: Minus,
    label: 'WAIT',
    color: 'text-muted-foreground',
    bg: 'bg-muted/10',
    border: 'border-border',
    glow: '',
    badge: 'bg-muted/20 text-muted-foreground border-border',
  },
};

export default function SignalCard({ signal, compact = false }) {
  if (!signal) return null;
  const cfg = SIDE_CONFIG[signal.side] || SIDE_CONFIG.WAIT;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative rounded-2xl border ${cfg.border} p-4
        bg-gradient-card backdrop-blur-sm
        ${signal.isHighAlert ? `animate-signal-glow ${cfg.glow}` : ''}
        ${compact ? 'p-3' : 'p-5'}
      `}
    >
      {/* High alert badge */}
      {signal.isHighAlert && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-alert text-[hsl(222,47%,4%)] text-[10px] font-bold font-mono uppercase tracking-wider shadow-glow-alert">
          <Zap className="w-3 h-3" />
          HIGH ALERT
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-foreground">{signal.symbol}</span>
              <Badge className={`text-[10px] px-1.5 py-0 border ${cfg.badge}`}>{cfg.label}</Badge>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{signal.timeframe}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
          <Target className="w-3 h-3" />
          RR 1:{signal.rr}
        </div>
      </div>

      {/* Price levels */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <PriceLevel label="ENTRY" value={signal.entry} color="text-foreground" />
        <PriceLevel label="SL" value={signal.sl} color="text-bearish" />
        <PriceLevel label="TP" value={signal.tp} color="text-bullish" />
      </div>

      {/* Confluences */}
      {!compact && (
        <div className="flex flex-wrap gap-1 mb-3">
          {signal.confluences?.slice(0, 4).map((c, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
              {c}
            </span>
          ))}
          {signal.confluences?.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              +{signal.confluences.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Score + timestamp */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-alert" />
          <span className="text-muted-foreground">Score: </span>
          <span className={signal.confluenceScore >= 5 ? 'text-alert font-bold' : 'text-foreground'}>
            {signal.confluenceScore}/6
          </span>
        </div>
        <span className="text-muted-foreground font-mono">
          {signal.timestamp ? formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true }) : 'just now'}
        </span>
      </div>
    </motion.div>
  );
}

function PriceLevel({ label, value, color }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/20">
      <div className="text-[9px] text-muted-foreground font-mono uppercase mb-1">{label}</div>
      <div className={`text-xs font-mono font-bold ${color}`}>
        {typeof value === 'number' ? value.toFixed(value > 100 ? 2 : value > 10 ? 3 : 5) : value}
      </div>
    </div>
  );
}
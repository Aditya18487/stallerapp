import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Filter, Zap, ScanSearch } from 'lucide-react';
import { generateScannerSignals } from '@/lib/signalEngine';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';
import PullToRefresh from '@/components/PullToRefresh';
import SubscriptionGate from '@/components/SubscriptionGate';
import { useSubscription } from '@/hooks/useSubscription';

const SIDE_CONFIG = {
  BUY: { icon: TrendingUp, color: 'text-bullish', bg: 'bg-bullish/10', border: 'border-bullish/30' },
  SELL: { icon: TrendingDown, color: 'text-bearish', bg: 'bg-bearish/10', border: 'border-bearish/30' },
  WAIT: { icon: Minus, color: 'text-muted-foreground', bg: 'bg-secondary', border: 'border-border' },
};

export default function ScannerPage() {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { isSubscribed } = useSubscription();

  const refresh = () => {
    return new Promise((resolve) => {
      setIsRefreshing(true);
      setTimeout(() => {
        setSignals(generateScannerSignals());
        setLastUpdated(new Date());
        setIsRefreshing(false);
        resolve();
      }, 500);
    });
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'ALL' ? signals : signals.filter(s => s.side === filter);

  if (!isSubscribed) {
    return <SubscriptionGate pageName="Market Scanner" />;
  }

  return (
    <PullToRefresh onRefresh={refresh}>
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Scanner" />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScanSearch className="w-5 h-5 text-primary" />
              <h1 className="font-display font-bold text-2xl text-foreground">Market Scanner</h1>
            </div>
            <p className="text-sm text-muted-foreground">Live SMC signals across all symbols</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-bullish animate-live-pulse" />
              {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {['ALL', 'BUY', 'SELL', 'WAIT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-mono font-medium transition-all border ${
                filter === f
                  ? f === 'BUY' ? 'bg-bullish/20 text-bullish border-bullish/40'
                    : f === 'SELL' ? 'bg-bearish/20 text-bearish border-bearish/40'
                    : 'bg-primary/20 text-primary border-primary/40'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'BUY Signals', count: signals.filter(s => s.side === 'BUY').length, color: 'text-bullish', bg: 'bg-bullish/10', border: 'border-bullish/30' },
            { label: 'SELL Signals', count: signals.filter(s => s.side === 'SELL').length, color: 'text-bearish', bg: 'bg-bearish/10', border: 'border-bearish/30' },
            { label: 'High Alert', count: signals.filter(s => s.isHighAlert).length, color: 'text-alert', bg: 'bg-alert/10', border: 'border-alert/30' },
          ].map(({ label, count, color, bg, border }) => (
            <div key={label} className={`p-4 rounded-2xl border ${border} ${bg}`}>
              <div className={`text-2xl font-display font-bold ${color}`}>{count}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {/* Scanner table */}
        <div className="rounded-2xl border border-border/60 bg-gradient-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">Symbol</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">Signal</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Entry</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest hidden sm:table-cell">SL</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest hidden sm:table-cell">TP</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest hidden md:table-cell">Score</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest hidden md:table-cell">Alert</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const cfg = SIDE_CONFIG[s.side];
                const Icon = cfg.icon;
                const digits = s.meta?.digits || 5;
                const fmt = (v) => typeof v === 'number' ? v.toFixed(v > 100 ? 2 : v > 10 ? 3 : digits) : '—';
                return (
                  <motion.tr
                    key={s.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-border/30 hover:bg-secondary/20 transition-colors ${s.isHighAlert ? 'bg-alert/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {s.isHighAlert && <Zap className="w-3 h-3 text-alert flex-shrink-0" />}
                        <span className="font-mono font-bold text-sm text-foreground">{s.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <Icon className="w-3 h-3" />
                        {s.side}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-foreground hidden sm:table-cell">{fmt(s.entry)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-bearish hidden sm:table-cell">{fmt(s.sl)}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-bullish hidden sm:table-cell">{fmt(s.tp)}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-secondary">
                          <div
                            className={`h-1.5 rounded-full ${s.confluenceScore >= 5 ? 'bg-alert' : s.confluenceScore >= 3 ? 'bg-bullish' : 'bg-muted-foreground'}`}
                            style={{ width: `${(s.confluenceScore / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{s.confluenceScore}/6</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      {s.isHighAlert ? (
                        <span className="text-[10px] font-mono font-bold text-alert border border-alert/30 bg-alert/10 px-1.5 py-0.5 rounded-full">HIGH</span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-foreground">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}
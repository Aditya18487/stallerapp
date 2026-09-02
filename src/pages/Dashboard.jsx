import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, LineChart, ScanSearch, Calculator, BookOpen, Building2, ArrowRight, Activity, Target, Shield } from 'lucide-react';
import { generateScannerSignals } from '@/lib/signalEngine';
import SignalCard from '@/components/SignalCard';
import LockedSignalCard from '@/components/LockedSignalCard';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';
import PullToRefresh from '@/components/PullToRefresh';
import { useSubscription } from '@/hooks/useSubscription';

const STATS = [
  { label: 'Win Rate (30d)', value: '78.4%', icon: Target, color: 'text-bullish', bg: 'bg-bullish/10' },
  { label: 'Signals Today', value: '14', icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'High Alerts', value: '3', icon: Zap, color: 'text-alert', bg: 'bg-alert/10' },
  { label: 'Avg RR', value: '1:3', icon: Shield, color: 'text-muted-foreground', bg: 'bg-secondary' },
];

const QUICK_LINKS = [
  { path: '/chart', icon: LineChart, label: 'Live Chart', desc: 'Candlestick + overlays', color: 'text-primary' },
  { path: '/scanner', icon: ScanSearch, label: 'Scanner', desc: 'Multi-symbol signals', color: 'text-bullish' },
  { path: '/calculator', icon: Calculator, label: 'Calculator', desc: 'Position sizing', color: 'text-alert' },
  { path: '/journal', icon: BookOpen, label: 'Journal', desc: 'Trade history & stats', color: 'text-primary' },
  { path: '/propfirm', icon: Building2, label: 'Prop Firm', desc: 'Challenge mode', color: 'text-bearish' },
];

export default function Dashboard() {
  const [signals, setSignals] = useState([]);
  const { isSubscribed } = useSubscription();

  const refresh = useCallback(() => {
    setSignals(generateScannerSignals());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const highAlerts = signals.filter(s => s.isHighAlert);
  const activeSignals = signals.filter(s => s.side !== 'WAIT').slice(0, 6);

  return (
    <PullToRefresh onRefresh={refresh}>
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Dashboard" showBackButton={false} />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent rounded-3xl" />
          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-bullish animate-live-pulse" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Markets Open</span>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
              Smart Money <span className="text-gradient-primary">Intelligence</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Real-time AI signals powered by top-down SMC analysis. Entry, SL, and TP with fixed 1:3 risk-reward.
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-border/60 bg-gradient-card p-4"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* High Alerts */}
        {highAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-alert" />
              <h2 className="font-display font-bold text-foreground">HIGH ALERT Signals</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-alert/20 text-alert border border-alert/30 font-mono">{highAlerts.length} active</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highAlerts.map((s, i) => (
                isSubscribed ? <SignalCard key={i} signal={s} /> : <LockedSignalCard key={i} signal={s} />
              ))}
            </div>
          </div>
        )}

        {/* Latest signals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="font-display font-bold text-foreground">Latest Signals</h2>
            </div>
            <Link to="/scanner" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSignals.map((s, i) => (
              isSubscribed ? <SignalCard key={i} signal={s} /> : <LockedSignalCard key={i} signal={s} />
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-4">Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {QUICK_LINKS.map(({ path, icon: Icon, label, desc, color }, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={path}
                  className="flex flex-col gap-2 p-4 rounded-2xl border border-border/60 bg-gradient-card hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
                  <div>
                    <div className="font-medium text-sm text-foreground">{label}</div>
                    <div className="text-[11px] text-muted-foreground">{desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}
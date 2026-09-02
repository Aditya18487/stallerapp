import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { generateScannerSignals } from '@/lib/signalEngine';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';
import SubscriptionGate from '@/components/SubscriptionGate';
import { useSubscription } from '@/hooks/useSubscription';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const { isSubscribed } = useSubscription();

  useEffect(() => {
    // Generate alert history from signal engine
    const all = [];
    for (let i = 0; i < 5; i++) {
      const sigs = generateScannerSignals();
      sigs.filter(s => s.isHighAlert || s.side !== 'WAIT').forEach(s => {
        all.push({
          ...s,
          id: `${s.symbol}-${i}`,
          triggeredAt: new Date(Date.now() - i * 18 * 60 * 1000 - Math.random() * 30 * 60000),
          acknowledged: i > 2,
        });
      });
    }
    all.sort((a, b) => b.triggeredAt - a.triggeredAt);
    setAlerts(all.slice(0, 20));
  }, []);

  const filtered = filter === 'high' ? alerts.filter(a => a.isHighAlert) : filter === 'active' ? alerts.filter(a => !a.acknowledged) : alerts;

  if (!isSubscribed) {
    return <SubscriptionGate pageName="Signal Alerts" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Alerts" />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-2xl text-foreground">Alerts</h1>
            {alerts.filter(a => !a.acknowledged).length > 0 && (
              <span className="w-5 h-5 rounded-full bg-alert text-[hsl(222,47%,4%)] text-[10px] font-bold flex items-center justify-center">
                {alerts.filter(a => !a.acknowledged).length}
              </span>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'high', label: '⚡ High Alert' },
            { id: 'active', label: 'Unread' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === id ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {filtered.map((alert, i) => {
            const isUp = alert.side === 'BUY';
            const Icon = isUp ? TrendingUp : TrendingDown;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`
                  flex items-start gap-4 p-4 rounded-2xl border transition-all
                  ${alert.isHighAlert ? 'border-alert/40 bg-alert/5' : 'border-border/60 bg-gradient-card'}
                  ${!alert.acknowledged ? 'ring-1 ring-primary/20' : 'opacity-70'}
                `}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${isUp ? 'bg-bullish/15' : 'bg-bearish/15'}`}>
                  <Icon className={`w-5 h-5 ${isUp ? 'text-bullish' : 'text-bearish'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-foreground">{alert.symbol}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${isUp ? 'text-bullish bg-bullish/10 border-bullish/30' : 'text-bearish bg-bearish/10 border-bearish/30'}`}>
                      {alert.side}
                    </span>
                    {alert.isHighAlert && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-alert border border-alert/30 bg-alert/10 px-1.5 py-0.5 rounded-full">
                        <Zap className="w-2.5 h-2.5" />
                        HIGH ALERT
                      </span>
                    )}
                    {alert.acknowledged && <CheckCircle className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-muted-foreground">Entry <span className="text-foreground">{alert.entry?.toFixed(alert.meta?.digits > 3 ? 5 : 2)}</span></span>
                    <span className="text-muted-foreground">SL <span className="text-bearish">{alert.sl?.toFixed(alert.meta?.digits > 3 ? 5 : 2)}</span></span>
                    <span className="text-muted-foreground">TP <span className="text-bullish">{alert.tp?.toFixed(alert.meta?.digits > 3 ? 5 : 2)}</span></span>
                    <span className="text-muted-foreground">Score <span className={alert.confluenceScore >= 5 ? 'text-alert' : 'text-foreground'}>{alert.confluenceScore}/6</span></span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {alert.triggeredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
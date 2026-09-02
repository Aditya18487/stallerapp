import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, TrendingUp, TrendingDown, Target, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';

const INITIAL_TRADES = [
  { id: 'seed-1', symbol: 'EURUSD', side: 'BUY', entry: 1.0823, sl: 1.0800, tp: 1.0892, result: 'WIN', pnl: 69, date: '2025-05-15', notes: 'Clean BOS on 1H, OTE touch confirmed' },
  { id: 'seed-2', symbol: 'XAUUSD', side: 'SELL', entry: 2348, sl: 2360, tp: 2312, result: 'WIN', pnl: 360, date: '2025-05-14', notes: 'Manipulation sweep above swing high' },
  { id: 'seed-3', symbol: 'BTCUSD', side: 'BUY', entry: 67200, sl: 66800, tp: 68400, result: 'LOSS', pnl: -400, date: '2025-05-13', notes: 'SL hit, late entry' },
  { id: 'seed-4', symbol: 'GBPUSD', side: 'SELL', entry: 1.2640, sl: 1.2665, tp: 1.2565, result: 'WIN', pnl: 75, date: '2025-05-12', notes: 'Bearish engulfing at key resistance' },
];

export default function JournalPage() {
  const [trades, setTrades] = useState(INITIAL_TRADES);
  const [showForm, setShowForm] = useState(false);
  const [newTrade, setNewTrade] = useState({ symbol: 'EURUSD', side: 'BUY', entry: '', sl: '', tp: '', result: 'WIN', pnl: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const wins = trades.filter(t => t.result === 'WIN').length;
  const winRate = trades.length ? ((wins / trades.length) * 100).toFixed(1) : 0;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const avgRR = 3;

  const addTrade = () => {
    const trade = { id: `trade-${Date.now()}`, ...newTrade, pnl: parseFloat(newTrade.pnl) || 0, _optimistic: true };
    setTrades(prev => [trade, ...prev]);
    setNewTrade({ symbol: 'EURUSD', side: 'BUY', entry: '', sl: '', tp: '', result: 'WIN', pnl: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Trade Journal" />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-2xl text-foreground">Trade Journal</h1>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Log Trade
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={BarChart3} label="Total Trades" value={trades.length} color="text-foreground" />
          <StatCard icon={Target} label="Win Rate" value={`${winRate}%`} color="text-bullish" />
          <StatCard icon={TrendingUp} label="Total P&L" value={`${totalPnl >= 0 ? '+' : ''}R${totalPnl.toLocaleString()}`} color={totalPnl >= 0 ? 'text-bullish' : 'text-bearish'} />
          <StatCard icon={Target} label="Avg RR" value={`1:${avgRR}`} color="text-primary" />
        </div>

        {/* Add trade form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4"
          >
            <h2 className="font-display font-semibold text-foreground">Log New Trade</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'symbol', label: 'Symbol' },
                { key: 'entry', label: 'Entry', type: 'number' },
                { key: 'sl', label: 'SL', type: 'number' },
                { key: 'tp', label: 'TP', type: 'number' },
                { key: 'pnl', label: 'P&L (R)', type: 'number' },
                { key: 'date', label: 'Date', type: 'date' },
              ].map(({ key, label, type = 'text' }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={newTrade[key]}
                    onChange={e => setNewTrade(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">Side</label>
                <div className="flex gap-2">
                  {['BUY', 'SELL'].map(s => (
                    <button key={s} onClick={() => setNewTrade(p => ({ ...p, side: s }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-mono font-bold border transition-all ${newTrade.side === s ? (s === 'BUY' ? 'bg-bullish/20 text-bullish border-bullish/40' : 'bg-bearish/20 text-bearish border-bearish/40') : 'border-border text-muted-foreground hover:bg-secondary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">Result</label>
                <div className="flex gap-2">
                  {['WIN', 'LOSS'].map(r => (
                    <button key={r} onClick={() => setNewTrade(p => ({ ...p, result: r }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-mono font-bold border transition-all ${newTrade.result === r ? (r === 'WIN' ? 'bg-bullish/20 text-bullish border-bullish/40' : 'bg-bearish/20 text-bearish border-bearish/40') : 'border-border text-muted-foreground hover:bg-secondary'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              placeholder="Notes..."
              value={newTrade.notes}
              onChange={e => setNewTrade(p => ({ ...p, notes: e.target.value }))}
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none h-20"
            />
            <div className="flex gap-3">
              <button onClick={addTrade} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">Save Trade</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm">Cancel</button>
            </div>
          </motion.div>
        )}

        {/* Trade list */}
        <div className="space-y-3">
          {trades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={trade._optimistic ? { opacity: 0, y: -12, scale: 0.98 } : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-card transition-all ${trade.result === 'WIN' ? 'border-bullish/20' : 'border-bearish/20'} ${trade._optimistic ? 'ring-1 ring-primary/40 shadow-glow' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${trade.result === 'WIN' ? 'bg-bullish/15' : 'bg-bearish/15'}`}>
                {trade.result === 'WIN' ? <CheckCircle className="w-5 h-5 text-bullish" /> : <XCircle className="w-5 h-5 text-bearish" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-bold text-foreground">{trade.symbol}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${trade.side === 'BUY' ? 'text-bullish bg-bullish/10 border border-bullish/30' : 'text-bearish bg-bearish/10 border border-bearish/30'}`}>{trade.side}</span>
                  <span className="text-xs text-muted-foreground font-mono ml-auto">{trade.date}</span>
                </div>
                {trade.notes && <p className="text-xs text-muted-foreground truncate">{trade.notes}</p>}
              </div>
              <div className={`text-right flex-shrink-0`}>
                <div className={`font-display font-bold text-lg ${trade.pnl >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {trade.pnl >= 0 ? '+' : ''}R{Math.abs(trade.pnl).toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">Entry {trade.entry}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-4">
      <Icon className={`w-5 h-5 ${color} mb-3`} />
      <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
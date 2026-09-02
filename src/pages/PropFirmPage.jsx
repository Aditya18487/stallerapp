import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, AlertTriangle, TrendingDown, CheckCircle, Target, DollarSign, Lock } from 'lucide-react';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';

const FIRMS = [
  { name: 'FTMO', maxLoss: 10, dailyLoss: 5, target: 10 },
  { name: 'MyForexFunds', maxLoss: 12, dailyLoss: 5, target: 10 },
  { name: 'The5ers', maxLoss: 4, dailyLoss: 2, target: 8 },
  { name: 'Custom', maxLoss: 10, dailyLoss: 5, target: 10 },
];

export default function PropFirmPage() {
  const [selectedFirm, setSelectedFirm] = useState(FIRMS[0]);
  const [accountSize, setAccountSize] = useState(100000);
  const [currentBalance, setCurrentBalance] = useState(100000);
  const [dailyStartBalance, setDailyStartBalance] = useState(100000);
  const [riskPerTrade, setRiskPerTrade] = useState(0.5);

  const maxDrawdown = accountSize * (selectedFirm.maxLoss / 100);
  const dailyLimit = accountSize * (selectedFirm.dailyLoss / 100);
  const profitTarget = accountSize * (selectedFirm.target / 100);

  const currentDrawdown = accountSize - currentBalance;
  const drawdownPct = (currentDrawdown / accountSize) * 100;
  const dailyLoss = dailyStartBalance - currentBalance;
  const dailyLossPct = (dailyLoss / accountSize) * 100;

  const isMaxDrawdownBreach = currentDrawdown >= maxDrawdown;
  const isDailyLimitBreach = dailyLoss >= dailyLimit;
  const isInDanger = drawdownPct >= selectedFirm.maxLoss * 0.7 || dailyLossPct >= selectedFirm.dailyLoss * 0.7;

  const maxTradesAtRisk = riskPerTrade > 0 ? Math.floor((dailyLimit - dailyLoss) / (accountSize * (riskPerTrade / 100))) : 0;
  const profitProgress = ((currentBalance - accountSize) / profitTarget) * 100;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Prop Firm Mode" />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Prop Firm Mode</h1>
        </div>

        {/* Firm selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FIRMS.map(firm => (
            <button
              key={firm.name}
              onClick={() => setSelectedFirm(firm)}
              className={`p-4 rounded-2xl border text-left transition-all ${selectedFirm.name === firm.name ? 'border-primary/50 bg-primary/10' : 'border-border/60 bg-gradient-card hover:border-primary/30'}`}
            >
              <div className="font-display font-bold text-sm text-foreground mb-1">{firm.name}</div>
              <div className="text-[10px] text-muted-foreground">Max DD: {firm.maxLoss}%</div>
              <div className="text-[10px] text-muted-foreground">Daily: {firm.dailyLoss}%</div>
              <div className="text-[10px] text-bullish">Target: {firm.target}%</div>
            </button>
          ))}
        </div>

        {/* Alert banners */}
        {isMaxDrawdownBreach && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl border border-bearish/50 bg-bearish/15">
            <Lock className="w-5 h-5 text-bearish flex-shrink-0" />
            <div>
              <div className="font-bold text-bearish">⚠️ MAX DRAWDOWN BREACHED — CHALLENGE FAILED</div>
              <div className="text-xs text-muted-foreground">Do not place any more trades. Contact your prop firm.</div>
            </div>
          </motion.div>
        )}

        {isDailyLimitBreach && !isMaxDrawdownBreach && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl border border-alert/50 bg-alert/10">
            <AlertTriangle className="w-5 h-5 text-alert flex-shrink-0" />
            <div>
              <div className="font-bold text-alert">Daily Loss Limit Reached — Stop Trading Today</div>
              <div className="text-xs text-muted-foreground">Come back tomorrow with a fresh daily limit.</div>
            </div>
          </motion.div>
        )}

        {isInDanger && !isMaxDrawdownBreach && !isDailyLimitBreach && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl border border-alert/30 bg-alert/5">
            <AlertTriangle className="w-4 h-4 text-alert flex-shrink-0" />
            <div className="text-sm text-alert">Approaching drawdown limits — consider reducing risk or stopping.</div>
          </motion.div>
        )}

        {/* Main grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Account inputs */}
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Account Status</h2>
            {[
              { label: 'Account Size (R)', key: 'accountSize', value: accountSize, setter: setAccountSize },
              { label: 'Current Balance (R)', key: 'currentBalance', value: currentBalance, setter: setCurrentBalance },
              { label: "Today's Start Balance (R)", key: 'dailyStartBalance', value: dailyStartBalance, setter: setDailyStartBalance },
              { label: 'Risk Per Trade (%)', key: 'riskPerTrade', value: riskPerTrade, setter: setRiskPerTrade, step: 0.1, max: 3 },
            ].map(({ label, key, value, setter, step = 1000, max }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground font-mono uppercase mb-1 block">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={e => setter(parseFloat(e.target.value) || 0)}
                  step={step}
                  max={max}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          {/* Risk dashboard */}
          <div className="space-y-4">
            {/* Drawdown gauges */}
            <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 space-y-4">
              <h2 className="font-display font-semibold text-foreground">Drawdown Monitors</h2>
              
              <DrawdownBar
                label="Max Drawdown"
                current={drawdownPct}
                limit={selectedFirm.maxLoss}
                icon={TrendingDown}
              />
              <DrawdownBar
                label="Daily Drawdown"
                current={dailyLossPct}
                limit={selectedFirm.dailyLoss}
                icon={AlertTriangle}
              />
              <DrawdownBar
                label="Profit Progress"
                current={Math.max(0, profitProgress)}
                limit={100}
                icon={Target}
                isProfit
              />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-gradient-card p-3 text-center">
                <Shield className="w-5 h-5 text-bullish mx-auto mb-2" />
                <div className="text-lg font-display font-bold text-bullish">R{(dailyLimit - Math.max(0, dailyLoss)).toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Daily Risk Remaining</div>
              </div>
              <div className="rounded-xl border border-border/60 bg-gradient-card p-3 text-center">
                <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-lg font-display font-bold text-primary">{Math.max(0, maxTradesAtRisk)}</div>
                <div className="text-[10px] text-muted-foreground">Trades Left Today</div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge rules */}
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4">{selectedFirm.name} Challenge Rules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Max Overall DD', value: `${selectedFirm.maxLoss}%`, value2: `R${(accountSize * selectedFirm.maxLoss / 100).toLocaleString()}`, ok: !isMaxDrawdownBreach },
              { label: 'Max Daily DD', value: `${selectedFirm.dailyLoss}%`, value2: `R${(accountSize * selectedFirm.dailyLoss / 100).toLocaleString()}`, ok: !isDailyLimitBreach },
              { label: 'Profit Target', value: `${selectedFirm.target}%`, value2: `R${profitTarget.toLocaleString()}`, ok: profitProgress >= 100 },
              { label: 'Recommended Risk', value: `${riskPerTrade}% / trade`, value2: `R${(accountSize * riskPerTrade / 100).toLocaleString()}`, ok: riskPerTrade <= 1 },
            ].map(({ label, value, value2, ok }) => (
              <div key={label} className={`p-3 rounded-xl border ${ok ? 'border-bullish/30 bg-bullish/5' : 'border-border bg-secondary/30'}`}>
                {ok ? <CheckCircle className="w-4 h-4 text-bullish mb-2" /> : <AlertTriangle className="w-4 h-4 text-muted-foreground mb-2" />}
                <div className="font-mono text-sm font-bold text-foreground">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className="text-[10px] text-muted-foreground">{value2}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DrawdownBar({ label, current, limit, icon: Icon, isProfit = false }) {
  const pct = Math.min(100, (current / limit) * 100);
  const color = isProfit
    ? 'bg-bullish'
    : pct >= 80 ? 'bg-bearish' : pct >= 60 ? 'bg-alert' : 'bg-bullish';
  const textColor = isProfit
    ? 'text-bullish'
    : pct >= 80 ? 'text-bearish' : pct >= 60 ? 'text-alert' : 'text-bullish';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <span className={`text-xs font-mono font-bold ${textColor}`}>
          {current.toFixed(2)}% / {limit}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className={`h-2.5 rounded-full ${color} transition-all`}
        />
      </div>
    </div>
  );
}
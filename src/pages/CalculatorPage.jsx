import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';

const PAIRS = {
  'EURUSD': { pipValue: 10, digits: 5 },
  'GBPUSD': { pipValue: 10, digits: 5 },
  'XAUUSD': { pipValue: 10, digits: 2 },
  'BTCUSD': { pipValue: 1, digits: 2 },
  'NAS100': { pipValue: 1, digits: 2 },
  'US30': { pipValue: 1, digits: 2 },
  'GBPJPY': { pipValue: 6.8, digits: 3 },
  'ETHUSD': { pipValue: 0.1, digits: 2 },
};

export default function CalculatorPage() {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPct, setRiskPct] = useState(1);
  const [pair, setPair] = useState('EURUSD');
  const [entry, setEntry] = useState(1.0850);
  const [sl, setSl] = useState(1.0820);
  const [rr, setRr] = useState(3);

  const calc = useMemo(() => {
    const pairInfo = PAIRS[pair] || PAIRS['EURUSD'];
    const riskAmount = accountSize * (riskPct / 100);
    const stopPips = Math.abs(entry - sl) / (pair.includes('JPY') ? 0.01 : 0.0001);
    const pipValue = pairInfo.pipValue;
    const lotSize = stopPips > 0 ? riskAmount / (stopPips * pipValue) : 0;
    const potentialProfit = riskAmount * rr;
    const tp = entry > sl ? entry + Math.abs(entry - sl) * rr : entry - Math.abs(entry - sl) * rr;

    return {
      riskAmount: riskAmount.toFixed(2),
      stopPips: stopPips.toFixed(1),
      lotSize: lotSize.toFixed(2),
      potentialProfit: potentialProfit.toFixed(2),
      tp: tp.toFixed(pairInfo.digits),
      pipValue,
    };
  }, [accountSize, riskPct, pair, entry, sl, rr]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Position Calculator" />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Position Calculator</h1>
        </div>

        <div className="space-y-4">
          {/* Account settings */}
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Account Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Account Size (ZAR)" value={accountSize} onChange={setAccountSize} type="number" prefix="R" />
              <InputField label="Risk %" value={riskPct} onChange={setRiskPct} type="number" suffix="%" step="0.1" min="0.1" max="5" />
            </div>
          </div>

          {/* Trade settings */}
          <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 space-y-4">
            <h2 className="font-display font-semibold text-foreground">Trade Settings</h2>
            <div>
              <label className="text-xs text-muted-foreground font-mono uppercase tracking-widest block mb-2">Symbol</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(PAIRS).map(p => (
                  <button
                    key={p}
                    onClick={() => setPair(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
                      pair === p ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Entry" value={entry} onChange={setEntry} type="number" step="0.0001" />
              <InputField label="Stop Loss" value={sl} onChange={setSl} type="number" step="0.0001" />
              <InputField label="Risk:Reward" value={rr} onChange={setRr} type="number" step="0.5" min="1" max="10" />
            </div>
          </div>

          {/* Results */}
          <motion.div
            key={JSON.stringify(calc)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4"
          >
            <h2 className="font-display font-semibold text-foreground">Calculation Results</h2>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard icon={AlertTriangle} label="Risk Amount" value={`R ${calc.riskAmount}`} color="text-bearish" />
              <ResultCard icon={TrendingUp} label="Potential Profit" value={`R ${calc.potentialProfit}`} color="text-bullish" />
              <ResultCard icon={Calculator} label="Stop Pips" value={calc.stopPips} color="text-foreground" />
              <ResultCard icon={DollarSign} label="Lot Size" value={calc.lotSize} color="text-primary" />
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Take Profit Level</div>
              <div className="text-xl font-display font-bold text-bullish font-mono">{calc.tp}</div>
              <div className="text-xs text-muted-foreground mt-1">Risk:Reward 1:{rr}</div>
            </div>
          </motion.div>

          {/* Risk warning */}
          {parseFloat(riskPct) > 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-alert/30 bg-alert/10"
            >
              <AlertTriangle className="w-4 h-4 text-alert flex-shrink-0 mt-0.5" />
              <div className="text-sm text-alert">
                Risking more than 2% per trade is not recommended for prop firm challenges. Consider reducing your risk percentage.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', prefix, suffix, step, min, max }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-mono uppercase tracking-widest block mb-2">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || e.target.value)}
          step={step}
          min={min}
          max={max}
          className={`w-full bg-secondary/50 border border-border rounded-xl py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all ${prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-7' : 'px-3'}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ icon: Icon, label, value, color }) {
  return (
    <div className="p-3 rounded-xl bg-secondary/40 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-2`} />
      <div className={`text-lg font-display font-bold ${color} font-mono`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
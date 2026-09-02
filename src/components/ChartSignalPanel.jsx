import React from 'react';
import { motion } from 'framer-motion';
import { Layers, GitBranch, AlertTriangle, Eye } from 'lucide-react';

function PriceBox({ label, value, digits = 5, color }) {
  const formatted = typeof value === 'number'
    ? value.toFixed(value > 1000 ? 2 : value > 100 ? 2 : value > 10 ? 3 : digits)
    : '—';
  return (
    <div className="text-center p-2 rounded-xl bg-secondary/40">
      <div className="text-[11px] font-mono text-muted-foreground uppercase mb-0.5">{label}</div>
      <div className={`text-[11px] font-mono font-bold ${color} leading-tight`}>{formatted}</div>
    </div>
  );
}

export default function ChartSignalPanel({ signal, symbol, cfg, SideIcon }) {
  if (!signal) return null;

  return (
    <>
      {/* Signal box */}
      <motion.div
        key={`${symbol}-${signal.side}`}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        className={`rounded-2xl border ${cfg.border} bg-gradient-card p-3 space-y-3 ${signal.isHighAlert ? 'animate-signal-glow' : ''}`}
      >
        <div className="font-display font-bold text-xs text-foreground">Live SMC Signal</div>

        <div className="grid grid-cols-3 gap-1.5">
          <PriceBox label="ENTRY" value={signal.entry} digits={signal.meta?.digits} color="text-foreground" />
          <PriceBox label="SL" value={signal.sl} digits={signal.meta?.digits} color="text-bearish" />
          <PriceBox label="TP" value={signal.tp} digits={signal.meta?.digits} color="text-bullish" />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">R:R</span>
          <span className="font-mono font-bold text-primary">1:{signal.rr}</span>
        </div>

        {/* Confluence bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-muted-foreground">Confluence</span>
            <span className={`font-mono font-bold ${signal.confluenceScore >= 5 ? 'text-alert' : 'text-foreground'}`}>{signal.confluenceScore}/6</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(signal.confluenceScore / 6) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${signal.confluenceScore >= 5 ? 'bg-alert' : signal.confluenceScore >= 3 ? 'bg-bullish' : 'bg-muted-foreground'}`}
            />
          </div>
        </div>

        {/* Confluences list */}
        <div className="space-y-1">
          {signal.confluences?.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <div className="w-1 h-1 rounded-full bg-bullish shrink-0 mt-1" />
              <span className="text-muted-foreground leading-tight">{c}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top-Down Analysis */}
      {signal.topDown && (
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-display font-bold text-xs text-foreground">
            <Layers className="w-3 h-3 text-primary" />
            Top-Down Analysis
          </div>
          <div className="space-y-1">
            {[
              { tf: '4H', bias: signal.topDown.htfBias, label: 'Macro bias' },
              { tf: '1H', bias: signal.topDown.itfBias, label: 'Structure' },
              { tf: '15M', bias: signal.side === 'WAIT' ? 'Neutral' : signal.side === 'BUY' ? 'Bullish' : 'Bearish', label: 'Entry TF' },
            ].map(({ tf, bias, label }) => (
              <div key={tf} className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-muted-foreground">{tf} {label}</span>
                <span className={`font-mono font-bold ${bias === 'Bullish' ? 'text-bullish' : bias === 'Bearish' ? 'text-bearish' : 'text-muted-foreground'}`}>{bias}</span>
              </div>
            ))}
          </div>
          <div className={`text-[11px] font-mono px-2 py-1 rounded-lg ${signal.topDown.aligned ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'}`}>
            {signal.topDown.aligned ? '✓ All TFs aligned — strong setup' : '⚠ TF misalignment — lower conviction'}
          </div>
        </div>
      )}

      {/* Pattern Recognition */}
      {signal.patterns?.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-display font-bold text-xs text-foreground">
            <GitBranch className="w-3 h-3 text-primary" />
            Patterns Detected
          </div>
          {signal.patterns.map((p, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <div className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />
              <span className="text-muted-foreground leading-tight">{p}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fake-out / Manipulation Alerts */}
      {signal.fakeouts?.length > 0 && (
        <div className="rounded-2xl border border-alert/30 bg-alert/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-display font-bold text-xs text-alert">
            <AlertTriangle className="w-3 h-3" />
            Fake-out / Manipulation
          </div>
          {signal.fakeouts.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <div className="w-1 h-1 rounded-full bg-alert shrink-0 mt-1.5" />
              <span className="text-muted-foreground leading-tight">{f}</span>
            </div>
          ))}
        </div>
      )}

      {/* SMC rationale */}
      {signal.rationale?.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-display font-bold text-xs text-foreground">
            <Eye className="w-3 h-3 text-primary" />
            SMC Analysis
          </div>
          {signal.rationale.map((line, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <span className="text-primary font-mono shrink-0">{String(i+1).padStart(2,'0')}</span>
              <span className="text-muted-foreground leading-tight">{line}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, TrendingUp, Shield, Zap, BarChart2, BookOpen, Building2, Bell, Calculator, ChevronDown, ChevronUp, GitBranch, Eye, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const PLANS = [
  {
    id: '3_months',
    name: 'Starter',
    term: '3-month commitment',
    monthly: 'R 1,200',
    total: 'R 3,600',
    badge: null,
    color: 'border-border/60',
    btnClass: 'border border-border text-foreground hover:bg-secondary',
    features: [
      'Full SMC signal access (all 8 pairs)',
      'Top-down 4H → 1H → 15M analysis',
      'Fibonacci OTE retracement (0.5–0.705)',
      'Fake-out & market manipulation detection',
      'Pattern recognition (BOS, CHoCH, FVG)',
      'Live candlestick chart with Entry/SL/TP',
      'Support & resistance auto-detection',
      'Position size calculator',
      'Trade journal & prop firm tracker',
    ],
    highlight: false,
  },
  {
    id: '6_months',
    name: 'Pro',
    term: '6-month commitment',
    monthly: 'R 1,000',
    total: 'R 6,000',
    badge: 'Most popular',
    color: 'border-primary/60 shadow-glow',
    btnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
    features: [
      'Everything in Starter',
      'Priority HIGH-ALERT audio alarms',
      'Multi-symbol live scanner (8 pairs)',
      'Confluence score 1–6 analytics',
      'Liquidity sweep identification',
      'Premium/Discount zone mapping',
      'Save R200/month vs Starter',
    ],
    highlight: true,
  },
  {
    id: '12_months',
    name: 'Elite',
    term: '12-month commitment',
    monthly: 'R 833',
    total: '~R 10,000',
    badge: 'Best value',
    color: 'border-alert/40',
    btnClass: 'border border-alert/40 text-alert hover:bg-alert/10',
    features: [
      'Everything in Pro',
      'Lowest monthly rate — save R367/mo vs Starter',
      'Admin dashboard & reseller licence',
      'Priority 1-on-1 support',
      'Early access to new analysis tools',
      'Telegram & WhatsApp signal push alerts',
    ],
    highlight: false,
  },
];

const FEATURES = [
  { icon: BarChart2, label: 'Top-Down Analysis', desc: '4H macro bias → 1H structure → 15M precise entry, covering the full market context' },
  { icon: Zap, label: 'Fibonacci OTE Zone', desc: '0.382, 0.5, 0.618, 0.705 retracement levels plotted live on every signal' },
  { icon: Shield, label: 'Fake-out Detection', desc: 'Identifies liquidity sweeps and stop-hunts before the real move begins' },
  { icon: TrendingUp, label: 'Pattern Recognition', desc: 'Auto-detects BOS, CHoCH, FVG, order blocks, and displacement candles' },
  { icon: Bell, label: 'Market Manipulation', desc: 'Flags institutional manipulation zones, smart money traps, and false breakouts' },
  { icon: Building2, label: 'Support & Resistance', desc: 'Dynamic S&R zones derived from swing highs/lows across multiple timeframes' },
  { icon: BookOpen, label: 'Trade Journal', desc: 'Log and review every trade with full P&L analytics and win-rate tracking' },
  { icon: Calculator, label: 'Risk Calculator', desc: 'Auto lot-size from account balance & risk % with prop firm safety checks' },
  { icon: Building2, label: 'Prop Firm Mode', desc: 'Track drawdown limits for FTMO, The5ers, MyForexFunds & more' },
];

const FAQS = [
  { q: 'How does billing work?', a: 'You link your South African bank account and a monthly debit order runs automatically on your chosen day. Choose a 3, 6, or 12-month commitment term for the best rate.' },
  { q: 'Can I cancel early?', a: 'You commit to the full term (e.g., 3 months). After the term ends you can cancel or switch plans at any time. No hidden fees.' },
  { q: 'Is the signal data live?', a: 'Yes. The signal engine runs a tick-by-tick simulation with SMC confluence detection, refreshing every 60 seconds with a live price feed.' },
  { q: 'Does it work for prop firm challenges?', a: 'Absolutely. The Prop Firm mode tracks daily loss limits, max drawdown, and profit targets for FTMO, The5ers, MyForexFunds, and more.' },
  { q: 'Which pairs are covered?', a: 'EURUSD, GBPUSD, XAUUSD, BTCUSD, ETHUSD, NAS100, US30, and GBPJPY — with more being added.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  const handleGetPlan = async (plan) => {
    try {
      const me = await base44.auth.me();
      if (me) {
        navigate('/billing');
      }
    } catch {
      navigate('/account');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 px-5 py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[hsl(222,47%,4%)]" />
            </div>
            <span className="font-display font-bold text-foreground">PrimeTrade</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Link
              to="/account"
              className="px-4 py-1.5 rounded-xl border border-border text-sm text-foreground hover:bg-secondary transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-16 pb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-[11px] font-mono uppercase tracking-widest text-primary mb-5">
            <Sparkles className="w-3 h-3" />
            Choose your plan
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            Trade with <span className="text-gradient-primary">institutional edge</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            AI-driven SMC signals for prop firm challenges and retail trading. Real-time Fibonacci OTE, BOS confirmation, and liquidity sweep detection — all in one dashboard.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${plan.color} ${plan.highlight ? 'bg-card' : 'bg-card/50'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <h3 className="font-display font-bold text-xl text-foreground mb-0.5">{plan.name}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">{plan.term}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-display font-bold text-foreground">{plan.monthly}</span>
                  <span className="text-sm text-muted-foreground">/ mo</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Total billed: <span className="text-foreground font-medium">{plan.total}</span>
                </p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-bullish shrink-0 mt-0.5" />
                    <span className="text-foreground/80 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleGetPlan(plan)}
                className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${plan.btnClass}`}
              >
                Get {plan.name} →
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-2">Everything you need to trade smarter</h2>
          <p className="text-muted-foreground text-center text-sm mb-8">Included in all plans</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-2">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-start gap-3 p-4 rounded-2xl border border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-0.5">{label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-8">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 bg-card/40 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center"
        >
          <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-foreground mb-2">Secure payments, no surprises</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Billed monthly via South African bank debit order. Link your bank account once and the debit runs automatically each month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleGetPlan(PLANS[0])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-all"
            >
              Starter — R 1,200/mo
            </button>
            <button
              onClick={() => handleGetPlan(PLANS[1])}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              Pro — R 1,000/mo (Most Popular)
            </button>
            <button
              onClick={() => handleGetPlan(PLANS[2])}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-alert/40 text-alert text-sm font-semibold hover:bg-alert/10 transition-all"
            >
              Elite — R 833/mo
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center">
        <p className="text-xs text-muted-foreground">© 2026 PrimeTrade · Smart Money Concepts Trading Platform</p>
      </footer>
    </div>
  );
}
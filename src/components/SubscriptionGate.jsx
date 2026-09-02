import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, CreditCard, TrendingUp, Zap, Shield, CheckCircle } from 'lucide-react';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';

const PLANS_QUICK = [
  { name: 'Starter', price: 'R 1,200/mo', term: '3 months' },
  { name: 'Pro', price: 'R 1,000/mo', term: '6 months', popular: true },
  { name: 'Elite', price: 'R 833/mo', term: '12 months' },
];

export default function SubscriptionGate({ children, pageName = 'Signals' }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title={pageName} />
      <div className="max-w-2xl mx-auto px-4 py-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl border border-border/60 bg-gradient-card p-8 text-center space-y-6"
        >
          {/* Lock icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-foreground">{pageName} are locked</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Subscribe to unlock live SMC signals with entry, stop-loss, and take-profit levels across all 8 instruments.
            </p>
          </div>

          {/* What you get */}
          <div className="grid grid-cols-3 gap-3 py-2">
            {[
              { icon: TrendingUp, label: 'Live Signals' },
              { icon: Zap, label: 'HIGH Alerts' },
              { icon: Shield, label: 'SMC Analysis' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/40">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-3 gap-3">
            {PLANS_QUICK.map(plan => (
              <div
                key={plan.name}
                className={`p-3 rounded-xl border text-center ${
                  plan.popular
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border/60 bg-secondary/30'
                }`}
              >
                <div className="text-xs font-display font-bold text-foreground">{plan.name}</div>
                <div className="text-sm font-mono font-bold text-primary mt-1">{plan.price}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{plan.term}</div>
                {plan.popular && (
                  <div className="text-[9px] text-primary font-mono mt-1">★ Popular</div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-glow w-full sm:w-auto justify-center"
            >
              <CreditCard className="w-4 h-4" />
              Subscribe Now
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground text-sm transition-all w-full sm:w-auto justify-center"
            >
              View full pricing
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Debit order billed monthly · Cancel anytime after term ends
          </p>
        </motion.div>
      </div>
    </div>
  );
}
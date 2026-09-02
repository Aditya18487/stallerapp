import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Check, ChevronLeft, Shield, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';

const PLANS = [
  { id: '3_months', name: 'Starter', monthly: 1200, term: 3, monthlyLabel: 'R 1,200', total: 'R 3,600' },
  { id: '6_months', name: 'Pro', monthly: 1000, term: 6, monthlyLabel: 'R 1,000', total: 'R 6,000', popular: true },
  { id: '12_months', name: 'Elite', monthly: 833, term: 12, monthlyLabel: 'R 833', total: 'R 9,996' },
];

export default function BillingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [selectedPlan, setSelectedPlan] = useState('6_months');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(searchParams.get('success') === 'true');

  const isSubscribed = user?.subscription_status === 'active';
  const plan = PLANS.find(p => p.id === selectedPlan);

  useEffect(() => {
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  }, [success, queryClient]);

  const handleSubscribe = async () => {
    setError('');

    if (window.self !== window.top) {
      setError('Checkout is only available from the published app. Please open the app directly to subscribe.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('paystackInitialize', {
        planId: plan.id,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing`,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to start checkout. Please try again.');
        setSubmitting(false);
      }
    } catch (e) {
      setError('Failed to start checkout. Please try again.');
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-bold text-xl text-foreground">Sign in required</h1>
          <button
            onClick={() => base44.auth.redirectToLogin('/billing')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md px-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-bullish/10 border border-bullish/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-bullish" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">Subscription Active!</h1>
          <p className="text-sm text-muted-foreground">
            Your {plan.name} plan is now active. You have full access to all PrimeTrade signals and features.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-background"
    >
      <TopNav />
      <MobileTopHeader title="Billing" />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Link to="/" className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">
            {isSubscribed ? 'Manage Billing' : 'Subscribe & Activate'}
          </h1>
        </div>

        {isSubscribed && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-bullish/30 bg-bullish/5">
            <CheckCircle2 className="w-5 h-5 text-bullish flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-bullish">Active Subscription — {user.subscription_plan || 'Pro'} Plan</div>
              <div className="text-xs text-muted-foreground">You have full access to all signals and features.</div>
            </div>
          </div>
        )}

        {/* Plan Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-primary/15 text-primary text-xs font-bold font-mono flex items-center justify-center">1</span>
            <h2 className="font-display font-semibold text-foreground">Choose your plan</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {PLANS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  selectedPlan === p.id
                    ? 'border-primary/50 bg-primary/5 shadow-glow'
                    : 'border-border/60 bg-gradient-card hover:border-border'
                }`}
              >
                {p.popular && (
                  <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider mb-1 block">★ Popular</span>
                )}
                <div className="font-display font-bold text-foreground">{p.name}</div>
                <div className="text-lg font-mono font-bold text-primary mt-1">{p.monthlyLabel}<span className="text-xs text-muted-foreground">/mo</span></div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.term} months · Total {p.total}</div>
                {selectedPlan === p.id && (
                  <Check className="w-4 h-4 text-primary absolute top-3 right-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary + checkout */}
        <div className="rounded-2xl border border-border/60 bg-secondary/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Plan</div>
              <div className="font-display font-bold text-foreground">{plan.name} ({plan.term} months)</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Monthly payment</div>
              <div className="font-mono font-bold text-primary text-lg">{plan.monthlyLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-bullish" />
            Secure payment via Paystack. Your card is charged monthly for {plan.term} months.
          </div>

          {error && (
            <div className="text-sm text-bearish bg-bearish/10 border border-bearish/30 rounded-xl px-4 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60 shadow-glow"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Redirecting to checkout...</>
            ) : (
              <><CreditCard className="w-4 h-4" /> Subscribe with Paystack</>
            )}
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            By subscribing you authorize PrimeTrade to charge {plan.monthlyLabel} monthly for {plan.term} months via Paystack.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
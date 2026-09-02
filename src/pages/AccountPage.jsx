import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, LogOut, Shield, CheckCircle, Calendar, TrendingUp, Settings, MessageCircle, Phone, Save, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';

export default function AccountPage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [savingContacts, setSavingContacts] = useState(false);
  const [contactsSaved, setContactsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setTelegram(user.telegram || '');
      setWhatsapp(user.whatsapp || '');
    }
  }, [user]);

  const saveContacts = async () => {
    setSavingContacts(true);
    setContactsSaved(true); // optimistic — flash success instantly
    try {
      await base44.auth.updateMe({ telegram: telegram.trim(), whatsapp: whatsapp.trim(), notifications_setup: true });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (e) {
      setContactsSaved(false); // revert on failure
    }
    setSavingContacts(false);
    setTimeout(() => setContactsSaved(false), 2500);
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
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">Welcome to PrimeTrade</h1>
          <p className="text-muted-foreground">Sign in to access your trading intelligence</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
          >
            Sign In
          </button>
          <div className="mt-2">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              View pricing →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Account" />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Account</h1>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-gradient-card p-6 space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-xl font-display font-bold text-primary">
                {user.full_name?.[0] || user.email?.[0] || 'U'}
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-lg text-foreground">{user.full_name || 'Trader'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              {user.role === 'admin' && (
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-mono">Administrator</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Subscription</h2>
          </div>

          {user.subscription_status === 'active' ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-bullish/10 border border-bullish/30">
                <CheckCircle className="w-5 h-5 text-bullish flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-bullish">Active — {user.subscription_plan || 'Pro'} Plan</div>
                  <div className="text-xs text-muted-foreground">Debit order billed monthly</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-secondary/40">
                  <div className="text-xs text-muted-foreground mb-1">Plan</div>
                  <div className="font-mono text-foreground">{user.subscription_plan || 'Pro'}</div>
                </div>
                <div className="p-3 rounded-xl bg-secondary/40">
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <div className="font-mono text-bullish flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </div>
                </div>
              </div>

              <Link to="/billing" className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Manage Billing & Bank Account
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-alert/10 border border-alert/30">
                <Lock className="w-5 h-5 text-alert flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-alert">No active subscription</div>
                  <div className="text-xs text-muted-foreground">Subscribe to unlock all signals and features</div>
                </div>
              </div>
              <Link to="/billing" className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all">
                <CreditCard className="w-4 h-4" />
                Subscribe Now
              </Link>
            </>
          )}
        </motion.div>

        {/* Admin links */}
        {user.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/60 bg-gradient-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Admin Panel</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/reseller" className="flex items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all text-sm text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                Reseller Management
              </Link>
              <Link to="/admin/audit" className="flex items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-all text-sm text-foreground">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Audit Log
              </Link>
            </div>
          </motion.div>
        )}

        {/* Notification Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/60 bg-gradient-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Signal Notifications</h2>
          </div>
          <p className="text-xs text-muted-foreground">Receive live SMC signals and HIGH-ALERT notifications on Telegram & WhatsApp.</p>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                Telegram
              </label>
              <input
                type="text"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder="@yourusername or +27..."
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/60 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                <Phone className="w-3.5 h-3.5 text-bullish" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+27 82 123 4567"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/60 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-bullish/50 focus:ring-1 focus:ring-bullish/30 transition-all font-mono"
              />
            </div>
          </div>

          <button
            onClick={saveContacts}
            disabled={savingContacts}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
          >
            {contactsSaved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> {savingContacts ? 'Saving...' : 'Save Contacts'}</>
            )}
          </button>
        </motion.div>

        {/* Sign out */}
        <button
          onClick={() => base44.auth.logout()}
          className="w-full py-3 rounded-xl border border-border text-muted-foreground hover:text-bearish hover:border-bearish/30 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* Delete account */}
        <DeleteAccountDialog userEmail={user.email} />
      </div>
    </div>
  );
}
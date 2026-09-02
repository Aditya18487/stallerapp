import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, TrendingUp, Bell, ArrowRight, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function OnboardingModal({ user, onComplete }) {
  const [telegram, setTelegram] = useState(user?.telegram || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      telegram: telegram.trim(),
      whatsapp: whatsapp.trim(),
      notifications_setup: true,
    });
    setSaved(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  const handleSkip = async () => {
    await base44.auth.updateMe({ notifications_setup: true });
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="w-full max-w-md rounded-2xl border border-primary/30 bg-card shadow-glow overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/40 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[hsl(222,47%,4%)]" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">Welcome to PrimeTrade</h2>
                <p className="text-xs text-muted-foreground">Set up your signal notifications</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get real-time SMC signals and HIGH-ALERT notifications sent directly to your Telegram & WhatsApp.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Telegram */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                Telegram Username or Number
              </label>
              <input
                type="text"
                value={telegram}
                onChange={e => setTelegram(e.target.value)}
                placeholder="@yourusername or +27..."
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">Your Telegram handle (e.g. @johntrader) or phone number</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                <Phone className="w-3.5 h-3.5 text-bullish" />
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+27 82 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-bullish/50 focus:ring-1 focus:ring-bullish/30 transition-all font-mono"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5">Include country code (e.g. +27 for South Africa)</p>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
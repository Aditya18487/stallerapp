import React, { useState, useEffect } from 'react';
import TickerBar from '@/components/TickerBar';
import BottomNav from '@/components/BottomNav';
import OnboardingModal from '@/components/OnboardingModal';
import KeepAliveOutlet from '@/components/KeepAliveOutlet';
import { base44 } from '@/api/base44Client';

export default function AppShell() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u && !u.notifications_setup) {
        setShowOnboarding(true);
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TickerBar />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto overflow-x-hidden overscroll-behavior-none relative">
        <KeepAliveOutlet />
      </main>
      <BottomNav />
      {showOnboarding && user && (
        <OnboardingModal
          user={user}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
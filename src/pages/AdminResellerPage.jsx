import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';
import MobileBottomSelect from '@/components/MobileBottomSelect';

export default function AdminResellerPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('Pro');
  const [search, setSearch] = useState('');
  const [granting, setGranting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const subscribers = (users || []).filter(u => u.subscription_status === 'active' || u.subscription_status === 'pending' || u.subscription_status === 'cancelled');
  const filtered = subscribers.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()));

  const handleGrant = async () => {
    if (!email) return;
    setError('');
    setSuccess('');
    setGranting(true);
    try {
      const res = await base44.functions.invoke('manageSubscription', {
        action: 'grant',
        email,
        plan,
      });
      setSuccess(res.data?.action === 'granted' ? `Granted ${res.data.plan} to ${email}` : 'Subscription granted');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEmail('');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to grant subscription');
    }
    setGranting(false);
  };

  const handleRevoke = async (userEmail) => {
    setError('');
    setSuccess('');
    try {
      await base44.functions.invoke('manageSubscription', {
        action: 'revoke',
        email: userEmail,
      });
      setSuccess(`Revoked access for ${userEmail}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to revoke subscription');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Reseller Management" />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Reseller Management</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-mono">Admin</span>
        </div>

        {/* Add reseller */}
        <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Grant Subscription</h2>
          </div>
          {error && <div className="text-sm text-bearish bg-bearish/10 border border-bearish/30 rounded-xl px-3 py-2">{error}</div>}
          {success && <div className="text-sm text-bullish bg-bullish/10 border border-bullish/30 rounded-xl px-3 py-2">{success}</div>}
          <div className="flex gap-3">
            <input
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <MobileBottomSelect
              value={plan}
              onChange={setPlan}
              options={[
                { value: 'Starter', label: 'Starter' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Elite', label: 'Elite' },
              ]}
              placeholder="Plan"
              triggerClassName="w-[130px] bg-secondary/50 border-border rounded-xl px-3 py-2 text-sm h-auto font-medium"
            />
            <button
              onClick={handleGrant}
              disabled={granting || !email}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {granting ? 'Granting...' : 'Grant'}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">User must be registered before you can grant access.</p>
        </div>

        {/* List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search subscribers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60">
                  {['Email', 'Plan', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading subscribers...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No subscribers found</td></tr>
                ) : filtered.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{r.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">{r.subscription_plan || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {r.subscription_status === 'active' ? <CheckCircle className="w-3.5 h-3.5 text-bullish" /> : r.subscription_status === 'cancelled' ? <XCircle className="w-3.5 h-3.5 text-bearish" /> : <Clock className="w-3.5 h-3.5 text-alert" />}
                        <span className={`text-xs ${r.subscription_status === 'active' ? 'text-bullish' : r.subscription_status === 'cancelled' ? 'text-bearish' : 'text-alert'}`}>{r.subscription_status || 'none'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.subscription_status === 'active' && (
                        <button
                          onClick={() => handleRevoke(r.email)}
                          className="p-1.5 rounded-lg hover:bg-bearish/10 text-muted-foreground hover:text-bearish transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
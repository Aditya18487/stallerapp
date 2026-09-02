import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, UserCheck, UserX, Clock } from 'lucide-react';
import TopNav from '@/components/TopNav';
import MobileTopHeader from '@/components/MobileTopHeader';

const MOCK_LOGS = [
  { id: 1, target_email: 'trader1@example.com', role: 'user', action: 'granted', performed_by_email: 'admin@primetrade.com', created_at: '2025-05-17T10:30:00Z' },
  { id: 2, target_email: 'reseller@example.com', role: 'moderator', action: 'granted', performed_by_email: 'admin@primetrade.com', created_at: '2025-05-16T15:20:00Z' },
  { id: 3, target_email: 'banned@example.com', role: 'user', action: 'revoked', performed_by_email: 'admin@primetrade.com', created_at: '2025-05-15T09:10:00Z' },
  { id: 4, target_email: 'newuser@example.com', role: 'user', action: 'granted', performed_by_email: 'admin@primetrade.com', created_at: '2025-05-14T14:45:00Z' },
  { id: 5, target_email: 'partner@firm.com', role: 'moderator', action: 'granted', performed_by_email: 'admin@primetrade.com', created_at: '2025-05-12T11:30:00Z' },
];

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_LOGS.filter(l =>
    l.target_email.toLowerCase().includes(search.toLowerCase()) ||
    l.action.includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <MobileTopHeader title="Audit Log" />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-2xl text-foreground">Audit Log</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-mono">Admin</span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search audit log..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-card ${log.action === 'granted' ? 'border-bullish/20' : 'border-bearish/20'}`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${log.action === 'granted' ? 'bg-bullish/10' : 'bg-bearish/10'}`}>
                {log.action === 'granted'
                  ? <UserCheck className="w-4 h-4 text-bullish" />
                  : <UserX className="w-4 h-4 text-bearish" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-foreground font-medium">{log.target_email}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border uppercase ${log.action === 'granted' ? 'text-bullish bg-bullish/10 border-bullish/30' : 'text-bearish bg-bearish/10 border-bearish/30'}`}>
                    {log.action}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{log.role}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">by {log.performed_by_email}</div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono flex-shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LineChart, ScanSearch, Bell, User, Calculator, BookOpen, Building2, Shield, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chart', icon: LineChart, label: 'Chart' },
  { path: '/scanner', icon: ScanSearch, label: 'Scanner' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/journal', icon: BookOpen, label: 'Journal' },
  { path: '/propfirm', icon: Building2, label: 'Prop Firm' },
];

export default function TopNav() {
  const location = useLocation();
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <nav className="hidden md:flex items-center gap-1 px-6 py-3 border-b border-border/40 bg-[hsl(222,47%,3%)]/90 backdrop-blur-xl sticky top-9 z-40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mr-6">
        <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[hsl(222,47%,4%)]" />
        </div>
        <span className="font-display font-bold text-sm text-foreground">PrimeTrade</span>
      </Link>

      {/* Nav items */}
      {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              active
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        );
      })}

      <div className="ml-auto flex items-center gap-2">
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/reseller" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <Shield className="w-3 h-3" />
              Admin
            </Link>
          </>
        )}
        <Link to="/account" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <User className="w-3.5 h-3.5" />
          {user?.full_name || 'Account'}
        </Link>
      </div>
    </nav>
  );
}
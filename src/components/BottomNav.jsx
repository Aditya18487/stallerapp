import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LineChart, ScanSearch, Bell, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/chart', icon: LineChart, label: 'Chart' },
  { path: '/scanner', icon: ScanSearch, label: 'Scanner' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/account', icon: User, label: 'Account' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) {
      // Active tab re-tap: reset to root
      navigate(path, { replace: true, state: { _tabReset: Date.now() } });
    } else {
      // Switch tab: push to maintain tab stack history
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[hsl(222,47%,3%)]/95 backdrop-blur-xl border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ path, icon: NavIcon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={(e) => handleTabClick(e, path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <NavIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
                {isActive && (
                <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
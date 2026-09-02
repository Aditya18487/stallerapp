import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

const ROOT_TABS = ['/', '/chart', '/scanner', '/alerts', '/account'];

export default function MobileTopHeader({ title, showBackButton = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootTab = ROOT_TABS.includes(location.pathname);
  const showBack = showBackButton && !isRootTab;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 md:hidden bg-[hsl(222,47%,3%)]/95 backdrop-blur-xl border-b border-border/40 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-3 px-4 h-14">
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
        )}
        <span className="font-display font-semibold text-foreground text-sm flex-1 truncate">{title}</span>
        <Link to="/" className="p-2 -mr-2">
          <TrendingUp className="w-5 h-5 text-primary" />
        </Link>
      </div>
    </header>
  );
}
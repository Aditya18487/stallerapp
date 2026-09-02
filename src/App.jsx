import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// App Shell
import AppShell from '@/components/AppShell';
import AdminRoute from '@/components/AdminRoute';

// Pages
import Dashboard from '@/pages/Dashboard';
import ChartPage from '@/pages/ChartPage';
import ScannerPage from '@/pages/ScannerPage';
import AlertsPage from '@/pages/AlertsPage';
import CalculatorPage from '@/pages/CalculatorPage';
import JournalPage from '@/pages/JournalPage';
import PropFirmPage from '@/pages/PropFirmPage';
import PricingPage from '@/pages/PricingPage';
import AccountPage from '@/pages/AccountPage';
import BillingPage from '@/pages/BillingPage';
import AdminResellerPage from '@/pages/AdminResellerPage';
import AuditLogPage from '@/pages/AuditLogPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-[hsl(222,47%,4%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">PrimeTrade loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/billing" element={<BillingPage />} />

      {/* App shell wraps subscriber routes */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/propfirm" element={<PropFirmPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/reseller" element={<AdminResellerPage />} />
          <Route path="/admin/audit" element={<AuditLogPage />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
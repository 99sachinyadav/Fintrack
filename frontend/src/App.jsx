import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import FinancialHealthPage from "./pages/FinancialHealthPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import LoanProviderPanelPage from "./pages/LoanProviderPanelPage";
import LoansPage from "./pages/LoansPage";
import LoginPage from "./pages/LoginPage";
import MarketTrendsPage from "./pages/MarketTrendsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import TransactionsPage from "./pages/TransactionsPage";
import LandingPage from "./pages/LandingPage";
import { useAuth } from "./context/AuthContext";

function AppShell() {
  return (
    <div className="app-grid min-h-screen bg-slate-50 text-slate-900 dark:bg-ink dark:text-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="investments" element={<InvestmentsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="market" element={<MarketTrendsPage />} />
            <Route path="health" element={<FinancialHealthPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="provider-panel" element={<LoanProviderPanelPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

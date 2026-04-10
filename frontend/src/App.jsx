import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import LoansPage from "./pages/LoansPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import TransactionsPage from "./pages/TransactionsPage";

function AppShell() {
  return (
    <div className="app-grid min-h-screen bg-slate-50 text-slate-900 dark:bg-ink dark:text-slate-50">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="investments" element={<InvestmentsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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

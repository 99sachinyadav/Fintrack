import clsx from "clsx";
import { Activity, BarChart3, Briefcase, CreditCard, HeartPulse, LineChart, LogOut, QrCode, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/investments", label: "Investment", icon: Briefcase },
  { to: "/transactions", label: "Transaction", icon: CreditCard },
  { to: "/payments", label: "Payments", icon: QrCode },
  { to: "/market", label: "Market Trends", icon: LineChart },
  { to: "/health", label: "Health", icon: HeartPulse },
  { to: "/loans", label: "Intelligence", icon: Sparkles },
  { to: "/profile", label: "Security", icon: Shield },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleNavItems = [
    ...navItems,
    ...((user?.role === "loan_provider" || user?.role === "admin")
      ? [{ to: "/provider-panel", label: "Provider Panel", icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="border-b border-slate-200/70 bg-white/78 p-4 shadow-panel backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/72 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-5">
      <div className="flex items-center justify-between lg:block">
        <div className="flex items-start gap-3 lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#09111f_0%,#18304c_100%)] text-sm font-semibold tracking-[0.16em] text-white dark:bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] dark:text-slate-100">
            FP
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand">
              Central Banking
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">FinPulse Command</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="lg:mt-6">
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:mt-8">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-800/65">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            <Activity size={14} />
            System status
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-950 dark:text-white">Portfolio sync</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-slate-50/85 p-3 dark:border-slate-700/80 dark:bg-slate-900/75 lg:mt-8">
        <div className="px-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          Workspace
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                clsx(
                  "min-w-fit flex-none whitespace-nowrap flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all lg:min-w-0 lg:flex-auto",
                  isActive
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/10 dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800/70",
                )
              }
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/5 dark:bg-slate-700/60">
                <Icon size={17} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
        </nav>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-white/75 p-4 dark:border-slate-700/80 dark:bg-slate-800/65 lg:mt-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Profile
        </div>
        <div className="mt-3 text-sm font-medium">{user?.username || "Analyst"}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Risk appetite: <span className="font-medium capitalize text-slate-700 dark:text-slate-100">{user?.risk_appetite}</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <ShieldCheck size={16} />
          Institutional-grade monitoring
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200 dark:hover:bg-rose-400/15 lg:mt-8"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </aside>
  );
}

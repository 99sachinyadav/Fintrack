import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CreditCard,
  Landmark,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import CategoryPieChart from "../charts/CategoryPieChart";
import InvestmentGrowthChart from "../charts/InvestmentGrowthChart";
import { useAuth } from "../context/AuthContext";
import {
  dashboardApi,
  investmentApi,
  loanApi,
  notificationApi,
  transactionApi,
} from "../services/api";
import { formatCurrency } from "../utils/formatters";

const topTabs = ["Markets", "Portfolio", "Analytics", "Vault"];
const sideNav = [
  { label: "Overview", icon: <Landmark size={18} />, to: "/" },
  { label: "Assets", icon: <BriefcaseBusiness size={18} />, to: "/investments" },
  { label: "Trade", icon: <Wallet size={18} />, to: "/transactions" },
  { label: "Intelligence", icon: <Sparkles size={18} />, to: "/loans" },
  { label: "Security", icon: <ShieldCheck size={18} />, to: "/profile" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [state, setState] = useState({
    analytics: null,
    summary: null,
    suggestions: [],
    loans: [],
    notifications: [],
    transactions: [],
  });

  useEffect(() => {
    async function loadDashboard() {
      const [
        analyticsResponse,
        summaryResponse,
        suggestionsResponse,
        loansResponse,
        notificationsResponse,
        transactionsResponse,
      ] = await Promise.all([
        dashboardApi.analytics(),
        investmentApi.summary(),
        investmentApi.suggestions(),
        loanApi.recommendations(),
        notificationApi.list(),
        transactionApi.list(),
      ]);

      setState({
        analytics: analyticsResponse.data,
        summary: summaryResponse.data,
        suggestions: suggestionsResponse.data,
        loans: loansResponse.data,
        notifications:
          notificationsResponse.data.results || notificationsResponse.data,
        transactions:
          transactionsResponse.data.results || transactionsResponse.data,
      });
    }

    loadDashboard().catch(() => {
      setState((current) => ({ ...current }));
    });
  }, []);

  const categorySpending = state.analytics?.category_spending || [];
  const recentTransactions = state.transactions.slice(0, 3);
  const bestLoan = state.loans[0];
  const totalCategorySpend = categorySpending.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0,
  );

  const expenseRows = categorySpending.slice(0, 3).map((item) => ({
    ...item,
    percentage:
      totalCategorySpend > 0
        ? Math.max(18, (Number(item.total || 0) / totalCategorySpend) * 100)
        : 24,
  }));

  return (
    <div className="min-h-screen bg-[#0f1217] text-white">
      <div className="border-b border-white/6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1460px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4 xl:gap-10">
            <div className="text-2xl font-semibold tracking-[-0.04em] text-cyan-400">
              Luminescence
            </div>
            <div className="flex flex-wrap items-center gap-6 text-lg text-slate-400">
              {topTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`border-b-2 pb-2 transition ${
                    index === 0
                      ? "border-cyan-400 text-cyan-400"
                      : "border-transparent hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-slate-300 transition hover:bg-white/5"
            >
              <Bell size={18} />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-slate-300 transition hover:bg-white/5"
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              className="rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-[#071017] transition hover:bg-cyan-300"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1460px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="hidden border-r border-white/6 pr-8 lg:flex lg:min-h-[calc(100vh-170px)] lg:flex-col">
          <div className="rounded-[24px] border border-white/6 bg-[#11151b] p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#2e3746_0%,#0d1116_100%)]" />
              <div>
                <div className="text-xl font-semibold tracking-[-0.03em] text-white">
                  {user?.username || "Alchemist Prime"}
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  Tier III Operator
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-fuchsia-500/20 bg-[linear-gradient(135deg,rgba(92,23,126,0.5),rgba(51,19,68,0.9))] p-5">
            <div className="text-xl font-semibold text-white">Upgrade to Neon</div>
            <div className="mt-2 text-sm leading-6 text-slate-300">
              Unlock deep liquidity pools, faster analytics refresh, and enhanced trust intelligence.
            </div>
          </div>

          <nav className="mt-8 grid gap-2">
            {sideNav.map((item, index) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-[1.05rem] transition ${
                    isActive
                      ? "border-l-4 border-cyan-400 bg-[linear-gradient(90deg,rgba(24,217,255,0.18),rgba(24,217,255,0.05))] text-cyan-300"
                      : "text-slate-300 hover:bg-white/5"
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-10">
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-base text-slate-300 transition hover:bg-white/5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-sm">
                ?
              </span>
              Support
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 rounded-2xl px-4 py-4 text-left text-base text-slate-300 transition hover:bg-white/5"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <main className="grid min-w-0 gap-8">
          <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
            <Panel className="bg-[radial-gradient(circle_at_top,rgba(24,217,255,0.14),transparent_55%),#1b1f25]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] text-slate-300">Total Net Worth</div>
                  <div className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-slate-100">
                    {formatCurrency(state.analytics?.net_worth)}
                  </div>
                  <div className="mt-3 text-lg text-slate-400">
                    Liquidity: {formatCurrency(user?.savings)}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/12 px-4 py-2 text-sm font-semibold text-emerald-400">
                  ↗ +12.4%
                </span>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <Link
                  to="/investments"
                  className="rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-semibold text-[#081017] transition hover:bg-cyan-300"
                >
                  Deposit
                </Link>
                <Link
                  to="/transactions"
                  className="rounded-2xl bg-white/10 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/15"
                >
                  Withdraw
                </Link>
              </div>
            </Panel>

            <Panel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[15px] text-slate-200">Portfolio Growth</div>
                <div className="flex items-center gap-3 text-sm">
                  {["1W", "1M", "1Y"].map((item, index) => (
                    <span
                      key={item}
                      className={`rounded-full px-4 py-2 font-semibold ${
                        index === 0
                          ? "bg-cyan-400/18 text-cyan-300"
                          : "text-slate-400"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 h-[300px]">
                <InvestmentGrowthChart data={state.analytics?.investment_growth || []} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <Panel>
              <div className="text-[15px] font-semibold text-white">Monthly Expenses</div>
              <div className="mt-8 grid gap-7">
                {expenseRows.length > 0 ? (
                  expenseRows.map((item, index) => (
                    <div key={item.category}>
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="text-base text-slate-300">{item.category}</div>
                        <div className="text-2xl font-semibold tracking-[-0.04em] text-slate-100">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-[#0d1014]">
                        <div
                          className={`h-full rounded-full ${
                            index === 0
                              ? "bg-cyan-400"
                              : index === 1
                                ? "bg-fuchsia-300"
                                : "bg-lime-400"
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">
                    Add transaction data to unlock expense analytics.
                  </div>
                )}
              </div>
            </Panel>

            <Panel>
              <div className="text-[15px] font-semibold text-white">Category Spending</div>
              <div className="mt-1 text-sm text-slate-400">
                Visual distribution of monthly capital
              </div>
              <div className="mt-5 h-[280px]">
                <CategoryPieChart data={categorySpending} />
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-5 text-sm text-slate-400">
                {(categorySpending.length > 0
                  ? categorySpending
                  : [
                      { category: "Fixed" },
                      { category: "Invest" },
                      { category: "Other" },
                    ]
                )
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={item.category} className="flex items-center gap-2">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          index === 0
                            ? "bg-cyan-400"
                            : index === 1
                              ? "bg-fuchsia-300"
                              : "bg-lime-400"
                        }`}
                      />
                      <span>{item.category}</span>
                    </div>
                  ))}
              </div>
            </Panel>
          </section>

          <section className="rounded-[32px] border border-white/6 bg-[#1a1e24]">
            <div className="flex flex-col gap-4 border-b border-white/6 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[15px] font-semibold text-white">Recent Activity</div>
                <div className="mt-1 text-sm text-slate-400">
                  Verified transaction ledger across your financial operations
                </div>
              </div>
              <Link
                to="/transactions"
                className="flex items-center gap-2 text-sm font-semibold text-cyan-300"
              >
                View Archive
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="hidden grid-cols-[1.25fr_1.1fr_0.8fr_0.75fr] gap-4 border-b border-white/6 px-6 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 lg:grid">
              <div>Asset / Entity</div>
              <div>Transaction ID</div>
              <div>Volume</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-white/6">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid gap-5 px-6 py-5 lg:grid-cols-[1.25fr_1.1fr_0.8fr_0.75fr] lg:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8 text-cyan-300">
                        {transaction.transaction_type === "credit" ? (
                          <Landmark size={20} />
                        ) : (
                          <CreditCard size={20} />
                        )}
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-white">
                          {transaction.category}
                        </div>
                        <div className="text-sm text-slate-400">
                          {transaction.description || "Financial ledger event"}
                        </div>
                      </div>
                    </div>

                    <div className="text-base text-slate-300">
                      {transaction.external_id || `TX_${transaction.id}`}
                    </div>

                    <div className="text-2xl font-semibold tracking-[-0.04em] text-white">
                      {transaction.transaction_type === "debit" ? "-" : "+"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>

                    <div>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          transaction.status === "success"
                            ? "bg-emerald-500/12 text-emerald-400"
                            : transaction.status === "pending"
                              ? "bg-cyan-500/12 text-cyan-300"
                              : "bg-rose-500/12 text-rose-400"
                        }`}
                      >
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-sm text-slate-400">
                  No activity yet. Add transactions or connect payment webhooks.
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <Panel>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold text-white">
                    Market Intelligence
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Moving average signals across tracked gold, stocks, and crypto
                  </div>
                </div>
                <Link
                  to="/investments"
                  className="flex items-center gap-2 text-sm font-semibold text-cyan-300"
                >
                  Explore
                  <ChevronRight size={16} />
                </Link>
              </div>
              <div className="mt-6 grid gap-4">
                {state.suggestions.length > 0 ? (
                  state.suggestions.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-white/6 bg-[#111418] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xl font-semibold text-white">{item.name}</div>
                          <div className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">
                            {item.asset_type} · {item.symbol}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            item.signal.action === "BUY"
                              ? "bg-emerald-500/12 text-emerald-400"
                              : item.signal.action === "SELL"
                                ? "bg-rose-500/12 text-rose-400"
                                : "bg-amber-500/12 text-amber-300"
                          }`}
                        >
                          {item.signal.action}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                        <div>
                          Short MA {formatCurrency(item.signal.short_moving_average)}
                        </div>
                        <div>
                          Long MA {formatCurrency(item.signal.long_moving_average)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">
                    Start tracking investments to unlock intelligent market timing.
                  </div>
                )}
              </div>
            </Panel>

            <Panel>
              <div className="text-[15px] font-semibold text-white">Trust Scored Lending</div>
              <div className="mt-1 text-sm text-slate-400">
                Ranked by affordability, reliability, and your live financial posture
              </div>
              {bestLoan ? (
                <div className="mt-6 grid gap-4">
                  <div className="rounded-[24px] bg-[linear-gradient(135deg,#123642_0%,#0f2330_100%)] p-5">
                    <div className="text-sm uppercase tracking-[0.18em] text-cyan-200">
                      {bestLoan.provider.name}
                    </div>
                    <div className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
                      {formatCurrency(bestLoan.eligible_amount)}
                    </div>
                    <div className="mt-3 text-sm text-slate-300">
                      EMI {formatCurrency(bestLoan.emi)} · {bestLoan.tenure_months} months
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricTile label="Trust Score" value={`${bestLoan.trust_score}/100`} />
                    <MetricTile
                      label="Interest Rate"
                      value={`${bestLoan.provider.interest_rate}%`}
                    />
                  </div>
                  <div className="rounded-[22px] border border-white/6 bg-[#111418] p-4 text-sm text-slate-400">
                    Financial score: {state.analytics?.financial_health?.score || "Pending"}
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-slate-400">
                  Seed loan providers to activate trust-ranked recommendations.
                </div>
              )}
            </Panel>
          </section>
        </main>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[32px] border border-white/6 bg-[#1a1e24] p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="rounded-[22px] border border-white/6 bg-[#111418] p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </div>
    </div>
  );
}

import { Bell, ChevronRight, CreditCard, Landmark, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryPieChart from "../charts/CategoryPieChart";
import ExpenseBarChart from "../charts/ExpenseBarChart";
import NetProfitChart from "../charts/NetProfitChart";
import { useAuth } from "../context/AuthContext";
import {
  authApi,
  dashboardApi,
  investmentApi,
  loanApi,
  notificationApi,
  transactionApi,
} from "../services/api";
import { formatCurrency } from "../utils/formatters";

const topTabs = ["Markets", "Portfolio", "Analytics", "Vault"];

const emptyTxSummary = {
  total_income: 0,
  total_expenses: 0,
  net_savings: 0,
  monthly_breakdown: [],
  monthly_trend: [],
  net_profit_chart: [],
  category_spending: [],
};

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const [state, setState] = useState({
    analytics: null,
    summary: null,
    suggestions: [],
    loans: [],
    notifications: [],
    transactions: [],
    txSummary: emptyTxSummary,
    paymentsUpdatedAt: null,
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
        txSummaryResponse,
      ] = await Promise.all([
        dashboardApi.analytics(),
        investmentApi.summary(),
        investmentApi.suggestions(),
        loanApi.recommendations(),
        notificationApi.list(),
        transactionApi.list(),
        transactionApi.summary(),
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
        txSummary: { ...emptyTxSummary, ...txSummaryResponse.data },
        paymentsUpdatedAt: new Date(),
      });
    }

    loadDashboard().catch(() => {
      setState((current) => ({ ...current }));
    });
  }, []);

  useEffect(() => {
    async function refreshStripePayments() {
      try {
        const [txList, txSum, profileRes] = await Promise.all([
          transactionApi.list(),
          transactionApi.summary(),
          authApi.profile(),
        ]);
        setUser(profileRes.data);
        setState((current) => ({
          ...current,
          transactions: txList.data.results || txList.data,
          txSummary: { ...emptyTxSummary, ...txSum.data },
          paymentsUpdatedAt: new Date(),
        }));
      } catch {
        /* keep current data */
      }
    }

    refreshStripePayments();
    const intervalMs = 12_000;
    const timer = setInterval(refreshStripePayments, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshStripePayments();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [setUser]);

  const categorySpending = state.txSummary?.category_spending || [];
  const monthlyTrend = state.txSummary?.monthly_trend || [];
  const netProfitChart = state.txSummary?.net_profit_chart || monthlyTrend;
  const recentTransactions = state.transactions;
  const bestLoan = state.loans[0];

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

      <div className="mx-auto max-w-[1460px] px-4 py-8 sm:px-6 lg:px-8">
        <main className="grid min-w-0 gap-8">
          <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(16,185,129,0.08),rgba(15,23,42,0.95))] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-400/90">
                  Stripe payments · Live
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Income and expense rows are created from Stripe webhooks. This panel refreshes about every 12 seconds and when you return to this tab.
                </p>
              </div>
              {state.paymentsUpdatedAt ? (
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                  Last sync: {state.paymentsUpdatedAt.toLocaleTimeString()}
                </span>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-500/20 bg-[#111418] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
                  Incoming (Income)
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-emerald-300">
                  +{formatCurrency(state.txSummary?.total_income || 0)}
                </div>
              </div>
              <div className="rounded-2xl border border-rose-500/20 bg-[#111418] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400/80">
                  Outgoing (Expense)
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-rose-300">
                  −{formatCurrency(state.txSummary?.total_expenses || 0)}
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-[#111418] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
                  Net flow
                </div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-cyan-200">
                  {Number(state.txSummary?.net_savings || 0) >= 0 ? "+" : ""}
                  {formatCurrency(state.txSummary?.net_savings || 0)}
                </div>
              </div>
            </div>
          </section>

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
                  to="/payments"
                  className="rounded-2xl bg-white/10 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/15"
                >
                  Pay with Stripe
                </Link>
              </div>
            </Panel>

            <Panel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-[15px] text-slate-200">Net Profit</div>
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
                <NetProfitChart data={netProfitChart} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
            <Panel>
              <div className="text-[15px] font-semibold text-white">Monthly Trend</div>
              <div className="mt-1 text-sm text-slate-400">
                Stripe incoming and outgoing payments grouped by month
              </div>
              <div className="mt-6 h-[280px]">
                <ExpenseBarChart data={monthlyTrend} />
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
                <div className="text-[15px] font-semibold text-white">All transaction history</div>
                <div className="mt-1 text-sm text-slate-400">
                  Each row is incoming (income) or outgoing (expense). The list updates automatically after Stripe confirms payment.
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
                        {transaction.transaction_type === "income" ? (
                          <Landmark size={20} />
                        ) : (
                          <CreditCard size={20} />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                              transaction.transaction_type === "income"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {transaction.transaction_type === "income" ? "Incoming" : "Outgoing"}
                          </span>
                        </div>
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
                      {transaction.transaction_type === "expense" ? "-" : "+"}
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
                  No Stripe payments yet. Use Payments to run checkout or a payment link—successful payments appear here after webhooks fire.
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

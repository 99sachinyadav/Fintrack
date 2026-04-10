import { useEffect, useState } from "react";
import CategoryPieChart from "../charts/CategoryPieChart";
import ExpenseBarChart from "../charts/ExpenseBarChart";
import InvestmentGrowthChart from "../charts/InvestmentGrowthChart";
import NetWorthAreaChart from "../charts/NetWorthAreaChart";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import {
  dashboardApi,
  investmentApi,
  loanApi,
  notificationApi,
} from "../services/api";
import { formatCurrency, formatPercent } from "../utils/formatters";

export default function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState({
    analytics: null,
    summary: null,
    suggestions: [],
    loans: [],
    notifications: [],
  });

  useEffect(() => {
    async function loadDashboard() {
      const [analytics, summary, suggestions, loans, notifications] = await Promise.all([
        dashboardApi.analytics(),
        investmentApi.summary(),
        investmentApi.suggestions(),
        loanApi.recommendations(),
        notificationApi.list(),
      ]);
      setState({
        analytics: analytics.data,
        summary: summary.data,
        suggestions: suggestions.data,
        loans: loans.data,
        notifications: notifications.data.results || notifications.data,
      });
    }

    loadDashboard().catch(() => {
      setState((current) => ({ ...current }));
    });
  }, []);

  const financialHealth = state.analytics?.financial_health;
  const bestLoan = state.loans[0];

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[36px] border border-slate-200/70 bg-[linear-gradient(135deg,#07111f_0%,#10223a_52%,#0e1a2d_100%)] p-8 text-white shadow-panel">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
            Financial command center
          </span>
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300">
            Real-time posture
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] lg:text-[3.6rem]">
              Welcome back, {user?.username}. Your portfolio, expenses, and credit posture are all in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
              Track market positions, review behavioral trends, and compare safe loan offers with dynamic trust scoring.
            </p>
          </div>
          <div className="min-w-[240px] rounded-[28px] border border-white/10 bg-white/10 px-5 py-5 backdrop-blur">
            <div className="text-sm uppercase tracking-[0.18em] text-slate-300">Financial health</div>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{financialHealth?.score || "Pending"}</div>
            <div className="mt-2 text-xs text-slate-300">
              Savings ratio {formatPercent(financialHealth?.savings_ratio)}
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            ["Portfolio discipline", "Track mark-to-market exposure and concentration."],
            ["Expense intelligence", "Review categories and monthly behavior shifts."],
            ["Credit trust scoring", "Compare safer borrowing options by provider."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-[24px] border border-white/10 bg-white/6 p-4">
              <div className="text-sm font-semibold">{title}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">{description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Portfolio value"
          value={formatCurrency(state.summary?.portfolio_value)}
          helper="Live mark-to-market portfolio balance"
          tone="default"
        />
        <StatCard
          label="Profit / loss"
          value={formatCurrency(state.summary?.profit_loss)}
          helper="Across gold, stocks, and crypto"
          tone="positive"
        />
        <StatCard
          label="Net worth"
          value={formatCurrency(state.analytics?.net_worth)}
          helper="Assets minus liabilities"
          tone="default"
        />
        <StatCard
          label="Safe EMI headroom"
          value={formatCurrency((Number(user?.income || 0) * 0.4) - Number(user?.monthly_loan_obligation || 0))}
          helper="Based on the 40% income rule"
          tone="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <SectionCard title="Investment growth" subtitle="Historical portfolio movement based on captured market prices">
          <InvestmentGrowthChart data={state.analytics?.investment_growth || []} />
        </SectionCard>
        <SectionCard title="AI suggestions" subtitle="Moving average strategy across tracked assets">
          <div className="grid gap-3">
            {state.suggestions.length > 0 ? (
              state.suggestions.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-300">{item.symbol}</div>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-brand dark:text-ink">
                      {item.signal.action}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
                    Short MA: {formatCurrency(item.signal.short_moving_average)} | Long MA: {formatCurrency(item.signal.long_moving_average)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Add investments and allow market snapshots to accumulate for signals.
              </p>
            )}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Monthly expenses" subtitle="Debit activity grouped by month" className="xl:col-span-2">
          <ExpenseBarChart data={state.analytics?.monthly_expenses || []} />
        </SectionCard>
        <SectionCard title="Category spending" subtitle="Expense category share">
          <CategoryPieChart data={state.analytics?.category_spending || []} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <SectionCard title="Net worth trend" subtitle="Projected from your latest financial position">
          <NetWorthAreaChart
            data={state.analytics?.investment_growth || []}
            netWorth={state.analytics?.net_worth || 0}
          />
        </SectionCard>
        <SectionCard title="Loan spotlight" subtitle="Top provider ranked by trust score and affordability">
          {bestLoan ? (
            <div className="grid gap-4">
              <div className="rounded-[24px] bg-slate-900 p-5 text-white dark:bg-white/5">
                <div className="text-sm text-slate-300">{bestLoan.provider.name}</div>
                <div className="mt-3 text-3xl font-semibold">
                  {formatCurrency(bestLoan.eligible_amount)}
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  EMI {formatCurrency(bestLoan.emi)} for {bestLoan.tenure_months} months
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-white/10">
                  <div className="text-sm text-slate-500 dark:text-slate-300">Trust score</div>
                  <div className="mt-2 text-2xl font-semibold">{bestLoan.trust_score}/100</div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-white/10">
                  <div className="text-sm text-slate-500 dark:text-slate-300">Interest rate</div>
                  <div className="mt-2 text-2xl font-semibold">{bestLoan.provider.interest_rate}%</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Add loan providers in the backend admin to see ranked recommendations.
            </p>
          )}
        </SectionCard>
      </section>

      <SectionCard title="Notification history" subtitle="Recent email events and reports">
        <div className="grid gap-3">
          {state.notifications.length > 0 ? (
            state.notifications.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div>
                  <div className="font-medium">{item.subject}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-300">{item.notification_type}</div>
                </div>
                <span className="rounded-full bg-slate-900/6 px-3 py-1 text-sm font-semibold capitalize dark:bg-white/5">{item.status}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Monthly summaries, profit/loss reports, and loan warnings will appear here.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { dashboardApi, loanApi, transactionApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function FinancialHealthPage() {
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [advice, setAdvice] = useState(null);

  useEffect(() => {
    Promise.all([dashboardApi.health(), transactionApi.summary(), loanApi.advice()])
      .then(([healthRes, summaryRes, adviceRes]) => {
        setHealth(healthRes.data);
        setSummary(summaryRes.data);
        setAdvice(adviceRes.data);
      })
      .catch(() => {
        setHealth(null);
        setSummary(null);
        setAdvice(null);
      });
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Financial health engine" subtitle="Calculated from income, expenses, debt, and savings">
        {health ? (
          <div className="grid gap-3">
            <Metric label="Score" value={health.score} />
            <Metric label="Savings ratio" value={`${health.savings_ratio}%`} />
            <Metric label="Expense ratio" value={`${health.expense_ratio}%`} />
            <Metric label="Debt-to-income ratio" value={`${health.loan_burden}%`} />
            <Metric label="Net worth" value={formatCurrency(health.net_worth)} />
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-300">Unable to load health metrics.</p>
        )}
      </SectionCard>
      <SectionCard title="Loan decision advisor" subtitle="Recommendation based on financial posture and provider trust">
        {advice ? (
          <div className="grid gap-3">
            <Metric label="Should take loan?" value={advice.should_take_loan ? "Yes" : "No"} />
            <div className="text-sm text-slate-500 dark:text-slate-300">{advice.reason}</div>
            <Metric label="Suggested min" value={formatCurrency(advice.range?.min || 0)} />
            <Metric label="Suggested max" value={formatCurrency(advice.range?.max || 0)} />
            <Metric label="Net savings (month)" value={formatCurrency(summary?.net_savings || 0)} />
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-300">Unable to load loan advice.</p>
        )}
      </SectionCard>
      {health && (
        <div className="xl:col-span-2">
          <SectionCard title="Raw User Health Data" subtitle="Your actual health data synced from the database">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Metric label="Income" value={formatCurrency(health.income || 0)} />
              <Metric label="Total Expenses" value={formatCurrency(health.expenses || 0)} />
              <Metric label="Savings Base" value={formatCurrency(health.savings || 0)} />
              <Metric label="Liabilities" value={formatCurrency(health.liabilities || 0)} />
              <Metric label="Monthly EMI Capacity" value={formatCurrency(health.monthly_loan_obligation || 0)} />
              <Metric label="Investment Assets" value={formatCurrency(health.assets || 0)} />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-700/80 dark:bg-slate-800/60">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

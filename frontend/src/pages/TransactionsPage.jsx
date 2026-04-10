import { useEffect, useMemo, useState } from "react";
import ExpenseBarChart from "../charts/ExpenseBarChart";
import SectionCard from "../components/SectionCard";
import { transactionApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    monthly_breakdown: [],
    total_income: 0,
    total_expenses: 0,
    net_savings: 0,
    category_spending: [],
  });

  const loadData = async () => {
    const [transactionsResponse, summaryResponse] = await Promise.all([
      transactionApi.list({ page_size: 100 }),
      transactionApi.summary(),
    ]);
    setTransactions(transactionsResponse.data.results || transactionsResponse.data);
    setSummary(summaryResponse.data);
  };

  useEffect(() => {
    loadData().catch(() => {
      setTransactions([]);
      setSummary({
        monthly_breakdown: [],
        total_income: 0,
        total_expenses: 0,
        net_savings: 0,
        category_spending: [],
      });
    });
  }, []);

  const expenseSeries = useMemo(
    () =>
      (summary.monthly_breakdown || []).filter(
        (item) => item.transaction_type === "expense",
      ),
    [summary],
  );

  return (
    <div className="grid gap-6">
      <SectionCard title="Auto captured transaction analytics" subtitle="Stripe webhooks drive all income and expense entries">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Total income" value={formatCurrency(summary.total_income || 0)} tone="text-emerald-400" />
          <Metric label="Total expenses" value={formatCurrency(summary.total_expenses || 0)} tone="text-rose-300" />
          <Metric label="Net savings" value={formatCurrency(summary.net_savings || 0)} tone="text-sky-300" />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Monthly expense trend" subtitle="Track monthly spending behavior">
          <ExpenseBarChart data={expenseSeries} />
        </SectionCard>
        <SectionCard title="Transaction feed" subtitle="Stripe webhook events only">
          <div className="grid gap-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-950 dark:text-white">{transaction.category}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-300">
                    {transaction.provider} · {transaction.transaction_type} · {transaction.stripe_payment_id || transaction.external_id}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-semibold text-slate-950 dark:text-white">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-300">
                    {new Date(transaction.occurred_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {transactions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                No transactions yet. Complete Stripe payments to populate this feed.
              </p>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/50 p-4 dark:border-slate-700/80 dark:bg-slate-800/60">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

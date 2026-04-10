import { useEffect, useState } from "react";
import ExpenseBarChart from "../charts/ExpenseBarChart";
import SectionCard from "../components/SectionCard";
import { transactionApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const initialForm = {
  amount: "",
  category: "",
  transaction_type: "debit",
  currency: "USD",
  description: "",
  occurred_at: "",
  metadata: {},
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    const [transactionsResponse, summaryResponse] = await Promise.all([
      transactionApi.list(),
      transactionApi.summary(),
    ]);
    setTransactions(transactionsResponse.data.results || transactionsResponse.data);
    setSummary(summaryResponse.data);
  };

  useEffect(() => {
    loadData().catch(() => {
      setTransactions([]);
      setSummary([]);
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    await transactionApi.create(form);
    setForm(initialForm);
    loadData();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard title="Add transaction" subtitle="Capture manual credits and debits alongside webhooks">
        <form onSubmit={onSubmit} className="grid gap-4">
          {["amount", "category", "currency", "description", "occurred_at"].map((field) => (
            <input
              key={field}
              type={field === "amount" ? "number" : field === "occurred_at" ? "datetime-local" : "text"}
              name={field}
              value={form[field]}
              placeholder={field.replaceAll("_", " ")}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              className="field-control"
            />
          ))}
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={(event) => setForm({ ...form, transaction_type: event.target.value })}
            className="field-control"
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-brand dark:text-ink"
          >
            Save transaction
          </button>
        </form>
      </SectionCard>

      <div className="grid gap-6">
        <SectionCard title="Monthly expense trend" subtitle="Track monthly spending behavior">
          <ExpenseBarChart data={summary.filter((item) => item.transaction_type === "debit")} />
        </SectionCard>
        <SectionCard title="Transaction feed" subtitle="Manual entries plus webhook imports">
          <div className="grid gap-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/45 p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-950 dark:text-white">{transaction.category}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-300">
                    {transaction.provider} · {transaction.transaction_type}
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
                No transactions yet. Add one or connect payment webhooks.
              </p>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

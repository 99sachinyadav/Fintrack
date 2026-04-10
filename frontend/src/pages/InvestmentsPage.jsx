import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { investmentApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const initialForm = {
  asset_type: "stock",
  symbol: "",
  name: "",
  buy_price: "",
  quantity: "",
  purchase_date: "",
  metadata: {},
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadInvestments = async () => {
    const response = await investmentApi.list();
    setInvestments(response.data.results || response.data);
  };

  useEffect(() => {
    loadInvestments().catch(() => setInvestments([]));
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    await investmentApi.create(form);
    setForm(initialForm);
    loadInvestments();
  };

  const removeInvestment = async (id) => {
    await investmentApi.remove(id);
    loadInvestments();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard title="Add investment" subtitle="Track gold, stock, and crypto positions">
        <form onSubmit={onSubmit} className="grid gap-4">
          <select
            name="asset_type"
            value={form.asset_type}
            onChange={(event) => setForm({ ...form, asset_type: event.target.value })}
            className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5"
          >
            <option value="gold">Gold</option>
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
          </select>
          {["symbol", "name", "buy_price", "quantity", "purchase_date"].map((field) => (
            <input
              key={field}
              type={field === "purchase_date" ? "date" : field.includes("price") || field === "quantity" ? "number" : "text"}
              name={field}
              value={form[field]}
              placeholder={field.replaceAll("_", " ")}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10 dark:bg-white/5"
            />
          ))}
          <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-brand dark:text-ink">
            Save investment
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Tracked portfolio" subtitle="Current pricing, P/L, and portfolio positions">
        <div className="grid gap-3">
          {investments.map((investment) => (
            <div key={investment.id} className="rounded-[24px] border border-slate-200/70 p-4 dark:border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{investment.name}</div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                    {investment.asset_type} · {investment.symbol}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeInvestment(investment.id)}
                  className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 dark:bg-rose-400/10 dark:text-rose-200"
                >
                  Delete
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Buy value" value={formatCurrency(investment.invested_value)} />
                <Metric label="Current value" value={formatCurrency(investment.current_value)} />
                <Metric label="Profit/Loss" value={formatCurrency(investment.profit_loss)} />
                <Metric label="Current price" value={formatCurrency(investment.current_price_cache)} />
              </div>
            </div>
          ))}
          {investments.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              No investments yet. Add one to start portfolio analytics.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
      <div className="text-sm text-slate-500 dark:text-slate-300">{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

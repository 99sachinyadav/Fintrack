import { Bell, CreditCard, ChevronRight, Landmark, Settings, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import RiskRadarChart from "../charts/RiskRadarChart";
import ProjectionEngine from "../components/ProjectionEngine";
import { useAuth } from "../context/AuthContext";
import { investmentApi, transactionApi } from "../services/api";
import { formatCurrency, formatPercent } from "../utils/formatters";

const initialForm = {
  asset_type: "stock",
  symbol: "",
  name: "",
  buy_price: "",
  quantity: "",
  purchase_date: "",
  metadata: {},
};

const topTabs = ["Markets", "Portfolio", "Analytics", "Vault"];

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadInvestments = async () => {
    const [listResponse, summaryResponse, suggestionResponse, txResponse] = await Promise.all([
      investmentApi.list({ page_size: 100 }),
      investmentApi.summary(),
      investmentApi.suggestions(),
      transactionApi.list({ page_size: 100 }),
    ]);
    setInvestments(listResponse.data.results || listResponse.data);
    setSummary(summaryResponse.data);
    setSuggestions(
      Array.isArray(suggestionResponse.data)
        ? suggestionResponse.data
        : suggestionResponse.data?.results || [],
    );
    setTransactions(txResponse.data.results || txResponse.data);
  };

  useEffect(() => {
    loadInvestments().catch(() => {
      setInvestments([]);
      setSummary(null);
      setSuggestions([]);
      setTransactions([]);
    });
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    await investmentApi.create({
      ...form,
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim(),
      buy_price: Number(form.buy_price),
      quantity: Number(form.quantity),
    });
    setForm(initialForm);
    loadInvestments();
  };

  const removeInvestment = async (id) => {
    await investmentApi.remove(id);
    loadInvestments();
  };

  const previewBuyPrice = Number(form.buy_price || 0);
  const previewQuantity = Number(form.quantity || 0);
  const projectedValue = previewBuyPrice * previewQuantity;
  const totalPositions = summary?.total_positions || investments.length || 0;
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const radarData = useMemo(() => {
    let stock = 10;
    let crypto = 10;
    let gold = 10;
    investments.forEach((inv) => {
      const val = Number(inv.current_value) || 0;
      const type = (inv.asset_type || "").toLowerCase();
      if (type === "stock") stock += val;
      else if (type === "crypto") crypto += val;
      else if (type === "gold") gold += val;
    });
    const total = stock + crypto + gold;
    return [
      { subject: "Growth\n(Stock)", A: Math.round((stock / total) * 100) },
      { subject: "Stability\n(Gold)", A: Math.round((gold / total) * 100) },
      { subject: "Volatility\n(Crypto)", A: Math.round((crypto / total) * 100) },
    ];
  }, [investments]);

  const leadingInvestment = useMemo(() => {
    if (!investments.length) return null;
    return [...investments].sort(
      (a, b) => Number(b.current_value || 0) - Number(a.current_value || 0),
    )[0];
  }, [investments]);

  const confidenceWidth = `${Math.min(92, 30 + totalPositions * 10)}%`;
  const progressWidth = `${Math.min(92, 20 + totalPositions * 12)}%`;

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
                    index === 1
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
          <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="px-1">
              <div className="text-[15px] font-semibold uppercase tracking-[0.34em] text-cyan-400">
                Liquidity Portal
              </div>
              <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
                Financial Levers
              </h1>
              <p className="mt-5 max-w-3xl text-xl leading-10 text-slate-300">
                Adjust your portfolio parameters and keep investment allocation, pricing,
                and intelligence in one responsive control room.
              </p>
            </div>

            <Panel className="self-start">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Active Portfolio
                  </div>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                    {leadingInvestment?.name || "Capital Expansion"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-lime-400">{totalPositions * 13 || 65}%</div>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-lime-400" style={{ width: progressWidth }} />
              </div>
            </Panel>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
              <Panel>
                <div className="text-center">
                  <div className="mb-2 text-[15px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    Risk Assessment Radar
                  </div>
                  <div className="text-sm text-slate-400 mb-4">
                    Live dynamic distribution of portfolio assets
                  </div>
                </div>
                <RiskRadarChart data={radarData} />
              </Panel>

              <Panel>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-3xl font-semibold tracking-[-0.04em] text-white">
                    Collateral Health
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-sm text-slate-200">
                    i
                  </span>
                </div>
                <div className="mt-6 overflow-hidden rounded-[22px] border border-white/6 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_45%),#12161b] p-5">
                  <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
                    Locked Value
                  </div>
                  <div className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white">
                    {formatCurrency(summary?.portfolio_value)}
                  </div>
                  <div className="mt-4 inline-flex rounded-xl bg-cyan-400/14 px-3 py-2 text-sm font-semibold text-cyan-300">
                    SAFE
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between gap-4 text-slate-300">
                  <span className="text-lg">Liquidation Point</span>
                  <span className="text-3xl font-semibold tracking-[-0.04em] text-slate-100">
                    {formatCurrency(Math.max(0, Number(summary?.portfolio_value || 0) * 0.18))}
                  </span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[#f5a4a3]" style={{ width: confidenceWidth }} />
                </div>
              </Panel>
          </section>

          <section>
            <div className="mb-4 text-[15px] font-semibold text-white">All portfolio positions</div>
            {investments.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {investments.map((investment, index) => (
                  <Panel key={investment.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(24,217,255,0.18),rgba(24,217,255,0.06))] text-cyan-300">
                        <TrendingUp size={28} />
                      </div>
                      <div
                        className={`text-lg font-semibold ${index % 2 === 0 ? "text-lime-400" : "text-[#e2a7ff]"}`}
                      >
                        {investment.asset_type}
                      </div>
                    </div>
                    <div className="mt-6 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                      {investment.name}
                    </div>
                    <div className="mt-3 text-sm uppercase tracking-[0.18em] text-slate-500">
                      {investment.symbol}
                    </div>
                    <div className="mt-4 text-base leading-7 text-slate-300">
                      {investment.asset_type} · Last price {formatCurrency(investment.current_price_cache)} · Value{" "}
                      {formatCurrency(investment.current_value)}
                      {investment.profit_loss != null ? (
                        <span className="mt-2 block text-slate-400">
                          P/L {formatCurrency(investment.profit_loss)} (
                          {formatPercent(investment.profit_loss_percentage)})
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInvestment(investment.id)}
                      className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/15"
                    >
                      Remove position
                    </button>
                  </Panel>
                ))}
              </div>
            ) : (
              <Panel>
                <div className="text-lg text-slate-400">
                  No positions yet. Add gold, stock, or crypto above to track them here.
                </div>
              </Panel>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr]">
            <Panel className="bg-transparent border-none p-0 xl:max-w-none">
                <ProjectionEngine />
            </Panel>
            
            <Panel className="bg-[linear-gradient(180deg,rgba(78,32,109,0.74),rgba(42,17,61,0.96))] xl:max-w-none">
              <div className="text-4xl font-semibold tracking-[-0.05em] text-[#f0c7ff]">
                Liquidity Advisor
              </div>
              <div className="mt-4 text-lg leading-8 text-slate-200">
                {safeSuggestions[0]
                  ? `${safeSuggestions[0].name} currently signals ${safeSuggestions[0].signal.action}. Review short and long moving averages before your next allocation shift.`
                  : "AI suggestions will appear here once market snapshots are captured across your tracked assets."}
              </div>
              <div className="mt-8 grid gap-4">
                {safeSuggestions.slice(0, 2).map((item) => (
                  <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/6 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xl font-semibold text-white">{item.name}</div>
                        <div className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-300">
                          {item.asset_type} · {item.symbol}
                        </div>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-cyan-300">
                        {item.signal.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section>
            <Panel>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-white">All transactions (Stripe)</div>
                  <div className="mt-1 text-sm text-slate-400">
                    Every incoming and outgoing payment linked to your account—same ledger as Dashboard and Transaction
                    page.
                  </div>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {transactions.length} record{transactions.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-6 hidden grid-cols-[1.1fr_1fr_0.9fr_0.85fr] gap-4 border-b border-white/6 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 lg:grid">
                <div>Details</div>
                <div>Reference</div>
                <div>Amount</div>
                <div>Status</div>
              </div>

              <div className="divide-y divide-white/6">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="grid gap-4 py-5 lg:grid-cols-[1.1fr_1fr_0.9fr_0.85fr] lg:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/8 text-cyan-300">
                          {tx.transaction_type === "income" ? <Landmark size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              tx.transaction_type === "income"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/20 text-rose-300"
                            }`}
                          >
                            {tx.transaction_type === "income" ? "Incoming" : "Outgoing"}
                          </span>
                          <div className="mt-1 font-semibold text-white">{tx.category}</div>
                          <div className="text-sm text-slate-400">{tx.description || "—"}</div>
                        </div>
                      </div>
                      <div className="text-sm text-slate-300 lg:text-base">
                        {tx.stripe_payment_id || tx.external_id || `TX_${tx.id}`}
                      </div>
                      <div className="text-xl font-semibold tabular-nums text-white lg:text-2xl">
                        {tx.transaction_type === "expense" ? "−" : "+"}
                        {formatCurrency(tx.amount, tx.currency)}
                      </div>
                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            tx.status === "success"
                              ? "bg-emerald-500/12 text-emerald-400"
                              : tx.status === "pending"
                                ? "bg-cyan-500/12 text-cyan-300"
                                : "bg-rose-500/12 text-rose-400"
                          }`}
                        >
                          {(tx.status || "").toUpperCase()}
                        </span>
                        <div className="mt-1 text-xs text-slate-500">
                          {tx.occurred_at ? new Date(tx.occurred_at).toLocaleString() : ""}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-sm text-slate-400">
                    No Stripe transactions yet. Payments you complete will appear here and on the dashboard.
                  </div>
                )}
              </div>
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
      className={`rounded-[32px] border border-white/6 bg-[#23262c] p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  accent = "text-slate-100",
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-xl text-slate-200">{label}</label>
        <div className={`text-2xl font-semibold ${accent}`}>
          {value ? value : placeholder}
        </div>
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input"
        required
      />
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[22px] bg-[#181b20] p-5">
      <div className="text-lg text-slate-400">{label}</div>
      <div className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-slate-100">
        {value}
      </div>
    </div>
  );
}

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
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { investmentApi } from "../services/api";
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
const sideNav = [
  { label: "Overview", icon: <Landmark size={18} />, to: "/" },
  { label: "Assets", icon: <BriefcaseBusiness size={18} />, to: "/investments" },
  { label: "Trade", icon: <Wallet size={18} />, to: "/transactions" },
  { label: "Intelligence", icon: <Sparkles size={18} />, to: "/loans" },
  { label: "Security", icon: <ShieldCheck size={18} />, to: "/profile" },
];

export default function InvestmentsPage() {
  const { user, logout } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState(initialForm);

  const loadInvestments = async () => {
    const [listResponse, summaryResponse, suggestionResponse] = await Promise.all([
      investmentApi.list(),
      investmentApi.summary(),
      investmentApi.suggestions(),
    ]);
    setInvestments(listResponse.data.results || listResponse.data);
    setSummary(summaryResponse.data);
    setSuggestions(
      Array.isArray(suggestionResponse.data)
        ? suggestionResponse.data
        : suggestionResponse.data?.results || [],
    );
  };

  useEffect(() => {
    loadInvestments().catch(() => {
      setInvestments([]);
      setSummary(null);
      setSuggestions([]);
    });
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

  const previewBuyPrice = Number(form.buy_price || 0);
  const previewQuantity = Number(form.quantity || 0);
  const projectedValue = previewBuyPrice * previewQuantity;
  const totalPositions = summary?.total_positions || investments.length || 0;
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  const reputationScore = useMemo(() => {
    const base = 620;
    const growthBoost = Number(summary?.profit_loss || 0) > 0 ? 120 : 55;
    const diversityBoost = Math.min(totalPositions * 18, 110);
    return base + growthBoost + diversityBoost;
  }, [summary, totalPositions]);

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

      <div className="mx-auto grid max-w-[1460px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="hidden border-r border-white/6 pr-8 lg:flex lg:min-h-[calc(100vh-170px)] lg:flex-col">
          <div className="rounded-[24px] border border-white/6 bg-[#11151b] p-5">
            <div className="text-xl font-semibold tracking-[-0.03em] text-[#e4b1ff]">
              {user?.username || "Alchemist Prime"}
            </div>
            <div className="mt-1 text-base text-slate-300">Tier III Operator</div>
          </div>

          <nav className="mt-8 grid gap-2">
            {sideNav.map((item) => (
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

          <div className="mt-auto space-y-4 pt-10">
            <div className="rounded-[22px] border border-cyan-500/12 bg-[linear-gradient(180deg,rgba(11,45,52,0.86),rgba(10,29,36,0.94))] p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Pro Access
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-2xl bg-cyan-400 px-5 py-3 text-lg font-semibold text-[#071017]"
              >
                Upgrade to Neon
              </button>
            </div>
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base text-slate-300 transition hover:bg-white/5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-sm">
                ?
              </span>
              Support
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-base text-slate-300 transition hover:bg-white/5"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

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

          <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
            <Panel className="bg-[radial-gradient(circle_at_top,rgba(24,217,255,0.1),transparent_52%),#23262c]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-4xl font-semibold tracking-[-0.05em] text-white">
                  Investment Precision Tuner
                </div>
                <span className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  Live tracked assets
                </span>
              </div>

              <form onSubmit={onSubmit} className="mt-10 grid gap-8">
                <div className="grid gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-xl text-slate-200">Asset Type</label>
                    <div className="text-2xl font-semibold text-cyan-300 capitalize">
                      {form.asset_type || "Stock"}
                    </div>
                  </div>
                  <select
                    name="asset_type"
                    value={form.asset_type}
                    onChange={(event) => setForm({ ...form, asset_type: event.target.value })}
                    className="auth-input"
                  >
                    <option value="gold">Gold</option>
                    <option value="stock">Stock</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Symbol"
                    value={form.symbol}
                    onChange={(event) => setForm({ ...form, symbol: event.target.value })}
                    placeholder="BTC, AAPL, GOLD"
                  />
                  <Field
                    label="Asset Name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Bitcoin"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Buy Price"
                    value={form.buy_price}
                    type="number"
                    onChange={(event) => setForm({ ...form, buy_price: event.target.value })}
                    placeholder="45000"
                    accent="text-cyan-300"
                  />
                  <Field
                    label="Quantity"
                    value={form.quantity}
                    type="number"
                    onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                    placeholder="2.5"
                    accent="text-[#e2a7ff]"
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-xl text-slate-200">Purchase Date</label>
                    <div className="text-2xl font-semibold text-slate-200">
                      {form.purchase_date || "Select date"}
                    </div>
                  </div>
                  <input
                    type="date"
                    name="purchase_date"
                    value={form.purchase_date}
                    onChange={(event) => setForm({ ...form, purchase_date: event.target.value })}
                    className="auth-input"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <MetricCard
                    label="Projected Value"
                    value={formatCurrency(projectedValue)}
                  />
                  <MetricCard
                    label="Portfolio Value"
                    value={formatCurrency(summary?.portfolio_value)}
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#1bd8f4_0%,#1396ad_100%)] px-5 py-5 text-2xl font-semibold text-[#071017] transition hover:brightness-110"
                >
                  Initialize Investment Entry
                  <ChevronRight size={24} />
                </button>
              </form>
            </Panel>

            <div className="grid gap-6">
              <Panel>
                <div className="text-center">
                  <div className="text-[13px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Reputation Quotient
                  </div>
                </div>
                <div className="relative mx-auto mt-8 flex h-[250px] w-[250px] items-center justify-center rounded-full">
                  <div className="absolute inset-0 rounded-full border-[16px] border-[#0b0d12]" />
                  <div
                    className="absolute inset-0 rounded-full border-[16px] border-cyan-400 [clip-path:inset(0_0_0_45%)]"
                    style={{ boxShadow: "0 0 20px rgba(24,217,255,0.35)" }}
                  />
                  <div className="absolute inset-[18px] rounded-full bg-[#1a1e24]" />
                  <div className="relative text-center">
                    <div className="text-7xl font-semibold tracking-[-0.06em] text-slate-100">
                      {Math.min(999, 720 + totalPositions * 24)}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-lime-400">
                      PRIME ELIGIBLE
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-slate-500">
                      Velocity
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-lime-400">
                      +{Math.max(6, totalPositions * 4)} pts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm uppercase tracking-[0.18em] text-slate-500">
                      Global Rank
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-slate-100">
                      Top 1.4%
                    </div>
                  </div>
                </div>
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
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.92fr_0.92fr_1.16fr]">
            {(investments.length > 0 ? investments : [null, null]).slice(0, 2).map((investment, index) => (
              <Panel key={investment?.id || `placeholder-${index}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(24,217,255,0.18),rgba(24,217,255,0.06))] text-cyan-300">
                    <TrendingUp size={28} />
                  </div>
                  <div className={`text-lg font-semibold ${index === 0 ? "text-lime-400" : "text-[#e2a7ff]"}`}>
                    {index === 0 ? "Fast Growth" : "Elite Tier"}
                  </div>
                </div>
                <div className="mt-8 text-4xl font-semibold tracking-[-0.05em] text-white">
                  {investment?.name || (index === 0 ? "Neon Bridge Asset" : "Obsidian Credit Line")}
                </div>
                <div className="mt-4 text-lg leading-8 text-slate-300">
                  {investment
                    ? `${investment.asset_type} tracked at ${formatCurrency(investment.current_price_cache)} with live value ${formatCurrency(investment.current_value)}.`
                    : index === 0
                      ? "Short-term liquidity for high-frequency market positioning."
                      : "Open-ended allocation channel for diversified operators."}
                </div>
                {investment ? (
                  <button
                    type="button"
                    onClick={() => removeInvestment(investment.id)}
                    className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-3 text-base font-semibold text-rose-200 transition hover:bg-rose-400/15"
                  >
                    Remove Position
                  </button>
                ) : null}
              </Panel>
            ))}

            <Panel className="bg-[linear-gradient(180deg,rgba(78,32,109,0.74),rgba(42,17,61,0.96))]">
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

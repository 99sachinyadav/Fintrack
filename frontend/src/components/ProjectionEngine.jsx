import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function ProjectionEngine() {
  const [params, setParams] = useState({
    initial_amount: 10000,
    monthly_contribution: 500,
    years: 5,
    asset_type: "blended",
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjection = async () => {
      setLoading(true);
      try {
        const res = await dashboardApi.projection(params);
        setData(res.data.projection || []);
      } catch (err) {
        console.error("Projection fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(() => {
      fetchProjection();
    }, 500); // debounce API calls
    
    return () => clearTimeout(timer);
  }, [params]);

  const latestVal = data.length > 0 ? data[data.length - 1].projected_value : 0;
  const baselineVal = data.length > 0 ? data[data.length - 1].baseline_value : 0;

  return (
    <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1b1f25] to-[#111418] p-6 shadow-2xl">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white">Future Wealth Projection</h2>
          <p className="mt-1 text-sm text-slate-400">Time-travel your portfolio using historical average returns (Crypto 18%, Stocks 8%, Gold 4%) vs standard 2% savings.</p>
        </div>
        <div className="flex flex-col text-right">
            <span className="text-xl font-bold tracking-tight text-emerald-400">{formatCurrency(latestVal)}</span>
            <span className="text-xs uppercase tracking-[0.15em] text-slate-500">vs {formatCurrency(baselineVal)} savings</span>
        </div>
      </div>

      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Initial Deposit ($)</span>
            <input 
                type="number" 
                className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 pr-2 text-lg font-bold text-slate-200 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50"
                value={params.initial_amount}
                onChange={(e) => setParams({ ...params, initial_amount: Number(e.target.value) })}
                step={100}
                min={0}
            />
        </label>
        
        <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-cyan-400">Monthly Contribution ($)</span>
            <input 
                type="number" 
                className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3 pr-2 text-lg font-bold text-cyan-200 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                value={params.monthly_contribution}
                onChange={(e) => setParams({ ...params, monthly_contribution: Number(e.target.value) })}
                step={50}
                min={0}
            />
        </label>

        <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Strategy Focus</span>
            <select
               className="w-full rounded-2xl border border-white/10 bg-[#161a20] p-3 text-lg font-bold text-slate-200 outline-none transition focus:border-cyan-400/50"
               value={params.asset_type}
               onChange={(e) => setParams({ ...params, asset_type: e.target.value })}
            >
                <option value="blended">Blended Portfolio</option>
                <option value="crypto">Max Volatility (Crypto)</option>
                <option value="stock">Growth (Stocks)</option>
                <option value="gold">Stability (Gold)</option>
            </select>
        </label>

        <label className="flex flex-col gap-2">
            <div className="flex justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">Timeline</span>
                <span className="text-xs font-semibold text-white">{params.years} Years</span>
            </div>
            <input 
                type="range" 
                className="mt-4 w-full accent-cyan-400"
                value={params.years}
                onChange={(e) => setParams({ ...params, years: Number(e.target.value) })}
                min={1}
                max={30}
                step={1}
            />
        </label>
      </div>

      <div className="h-[300px] w-full">
        {loading && data.length === 0 ? (
           <div className="flex h-full items-center justify-center text-slate-500">Simulating...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#475569" 
                tick={{fill: '#64748b', fontSize: 12}} 
                minTickGap={40}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                 width={70} 
                 stroke="#475569" 
                 tick={{fill: '#64748b', fontSize: 12}}
                 axisLine={false}
                 tickLine={false}
                 tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                 contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    color: "#fff",
                  }}
                  itemStyle={{ fontWeight: "bold" }}
                  formatter={(val, name) => [formatCurrency(val), name === "projected_value" ? "Invested" : "Savings"]}
              />
              <Area type="monotone" dataKey="baseline_value" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" />
              <Area type="monotone" dataKey="projected_value" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorProjected)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

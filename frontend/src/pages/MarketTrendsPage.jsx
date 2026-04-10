import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import SectionCard from "../components/SectionCard";
import { recommendationApi } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function MarketTrendsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recommendationApi
      .marketTiming()
      .then((response) => setRows(response.data))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionCard
      title="Market timing advisor"
      subtitle="Track gold, stocks, and crypto with historical timing guidance"
    >
      {loading ? (
        <div className="flex h-32 items-center justify-center text-slate-500">Loading historical trends...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {rows.map((item) => {
            const isBuy = item.action === "BUY";
            const isSell = item.action === "SELL";
            const color = isBuy ? "#10b981" : isSell ? "#ef4444" : "#eab308";
            
            return (
              <div
                key={`${item.asset_type}-${item.symbol}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-[#1e2329]/90 to-[#14181c]/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
              >
                {/* Glowing orb background effect */}
                <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] transition-all duration-500 group-hover:bg-blue-400/20" />
                
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                      {item.image && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 p-1 shadow-inner ring-1 ring-white/20">
                            <img src={item.image} alt={item.symbol} className="h-full w-full rounded-full object-cover" />
                        </div>
                      )}
                      {item.symbol} <span className="ml-2 rounded-md bg-white/5 px-2 py-0.5 text-sm font-medium uppercase tracking-wider text-slate-400 backdrop-blur-md">{item.asset_type}</span>
                    </h3>
                    <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-3xl font-black tracking-tighter text-white">
                        {formatCurrency(item.latest_price, item.currency)}
                        </span>
                        {item.price_change_24h !== undefined && item.price_change_24h !== null && (
                          <span className={`flex items-center rounded-full px-2 py-0.5 text-sm font-bold ${item.price_change_24h >= 0 ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-rose-500/10 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]"}`}>
                            {item.price_change_24h >= 0 ? "↑" : "↓"} {Math.abs(item.price_change_24h).toFixed(2)}%
                          </span>
                        )}
                    </div>
                  </div>
                  
                  <div className={`flex flex-col items-end`}>
                    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold shadow-lg shadow-black/20 ${isBuy ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : isSell ? 'border-red-500/30 bg-red-500/20 text-red-400' : 'border-yellow-500/30 bg-yellow-500/20 text-yellow-400'}`}>
                        {item.action}
                    </span>
                    <span className="mt-2 text-xs font-medium text-slate-400">RSI(14): {item.rsi_14?.toFixed(1) ?? "N/A"}</span>
                  </div>
                </div>

                <div className="mt-auto h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={item.history}>
                      <defs>
                        <linearGradient id={`gradient-${item.symbol.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                        labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
                        formatter={(val) => [formatCurrency(val, item.currency), "Price"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#gradient-${item.symbol.replace(/\s+/g, '')})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 flex flex-col gap-2 rounded-xl border border-white/5 bg-black/20 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Best Historical Entry</span>
                        <span className="text-sm font-medium text-slate-300">{item.best_buy_day}</span>
                    </div>
                    <div className="hidden h-8 w-px bg-white/10 sm:block"></div>
                    <div className="flex flex-col sm:items-end">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Best Historical Exit</span>
                        <span className="text-sm font-medium text-slate-300">{item.best_sell_day}</span>
                    </div>
                </div>
              </div>
            );
          })}
          {rows.length === 0 ? (
            <p className="col-span-full pt-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No market history available at this moment.
            </p>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "../utils/formatters";

export default function NetProfitChart({ data }) {
  const chartData =
    data.length > 0
      ? data.map((item) => ({
          month: item.month
            ? new Date(item.month).toLocaleDateString("en-US", { month: "short" })
            : "Now",
          net_profit: Number(item.net_profit || 0),
        }))
      : [{ month: "Now", net_profit: 0 }];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
        <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => `${value < 0 ? "-" : ""}$${Math.abs(value)}`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            background: "#111418",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            color: "#fff",
          }}
        />
        <Bar dataKey="net_profit" radius={[10, 10, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.net_profit >= 0 ? "#18d9ff" : "#fb7185"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

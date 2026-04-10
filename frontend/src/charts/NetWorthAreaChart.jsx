import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function NetWorthAreaChart({ data, netWorth }) {
  const chartData =
    data.length > 0
      ? data.map((item) => ({
          month: item.month
            ? new Date(item.month).toLocaleDateString("en-US", { month: "short" })
            : "Now",
          total: Number(item.total || 0),
        }))
      : [{ month: "Current", total: Number(netWorth || 0) }];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Area type="monotone" dataKey="total" stroke="#ffb84d" fill="#ffb84d55" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

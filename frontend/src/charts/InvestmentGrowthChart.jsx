import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function InvestmentGrowthChart({ data }) {
  const chartData = data.map((item) => ({
    month: item.month ? new Date(item.month).toLocaleDateString("en-US", { month: "short" }) : "Now",
    total: Number(item.total || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
        <XAxis dataKey="month" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#5be7c4" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

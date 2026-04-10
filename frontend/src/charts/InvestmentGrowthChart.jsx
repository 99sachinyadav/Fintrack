import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function InvestmentGrowthChart({ data }) {
  const chartData = data.map((item) => ({
    month: item.month
      ? new Date(item.month).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
      : "NOW",
    total: Number(item.total || 0),
  }));

  const fallbackData =
    chartData.length > 0
      ? chartData
      : [
          { month: "MON", total: 540000 },
          { month: "TUE", total: 420000 },
          { month: "WED", total: 500000 },
          { month: "THU", total: 680000 },
          { month: "FRI", total: 590000 },
          { month: "SAT", total: 820000 },
          { month: "SUN", total: 730000 },
        ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={fallbackData} barCategoryGap={18}>
        <XAxis
          dataKey="month"
          stroke="#8b96a7"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "#111418",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            color: "#fff",
          }}
          formatter={(value) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(Number(value || 0))
          }
        />
        <Bar dataKey="total" radius={[14, 14, 0, 0]}>
          {fallbackData.map((entry, index) => (
            <Cell
              key={`${entry.month}-${index}`}
              fill={index === 5 ? "#1bd8f4" : "rgba(33, 102, 116, 0.72)"}
              stroke={index === 5 ? "#30ebff" : "transparent"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

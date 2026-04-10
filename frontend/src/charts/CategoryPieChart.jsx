import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#18d9ff", "#d79afc", "#4be24d", "#5b8fff", "#ffb84d", "#38bdf8"];

export default function CategoryPieChart({ data }) {
  const chartData = data.map((item) => ({
    name: item.category,
    value: Number(item.total || 0),
  }));

  const fallbackData =
    chartData.length > 0
      ? chartData
      : [
          { name: "Fixed", value: 3200 },
          { name: "Invest", value: 1850 },
          { name: "Other", value: 940 },
        ];

  const total = fallbackData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={fallbackData}
          dataKey="value"
          nameKey="name"
          innerRadius={84}
          outerRadius={104}
          paddingAngle={3}
          stroke="transparent"
        >
          {fallbackData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <text
          x="50%"
          y="47%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#f3f4f6"
          fontSize="18"
          fontWeight="700"
        >
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(total)}
        </text>
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8b96a7"
          fontSize="11"
          fontWeight="700"
        >
          TOTAL OUT
        </text>
        <Tooltip
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
      </PieChart>
    </ResponsiveContainer>
  );
}

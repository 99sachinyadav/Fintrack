import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#5be7c4", "#5b8fff", "#ffb84d", "#ff7c7c", "#9f7aea", "#38bdf8"];

export default function CategoryPieChart({ data }) {
  const chartData = data.map((item) => ({
    name: item.category,
    value: Number(item.total || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100}>
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

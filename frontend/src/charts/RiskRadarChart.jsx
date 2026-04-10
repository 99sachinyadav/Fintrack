import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RiskRadarChart({ data }) {
  const radarData = data || [
    { subject: "Growth", A: 10, fullMark: 100 },
    { subject: "Stability", A: 10, fullMark: 100 },
    { subject: "Volatility", A: 10, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
          }}
          itemStyle={{ color: "#22d3ee", fontWeight: "bold" }}
          formatter={(value) => `${value}% Weight`}
        />
        <Radar
          name="Exposure"
          dataKey="A"
          stroke="#22d3ee"
          strokeWidth={3}
          fill="url(#radarGradient)"
          fillOpacity={0.6}
        />
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
          </linearGradient>
        </defs>
      </RadarChart>
    </ResponsiveContainer>
  );
}

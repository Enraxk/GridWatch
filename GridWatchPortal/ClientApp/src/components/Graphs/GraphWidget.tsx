import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";

export type GraphPoint = {
  timestamp: string;
  value: number;
};

export type GraphSeries = {
  seriesName: string;
    graphType: string; 
  unit: string;
  feederId: string;
  deviceId:string;
  dataPoints: GraphPoint[];
};

type Props = {
  title: string;
  series: GraphSeries[];
};

export default function GraphWidget({ title, series }: Props) {
  const allTimestamps = Array.from(
    new Set(series.flatMap((s) => s.dataPoints.map((p) => p.timestamp)))
  ).sort();

  const mergedData = allTimestamps.map((timestamp) => {
    const point: any = { timestamp };
    series.forEach((s) => {
      const match = s.dataPoints.find((p) => p.timestamp === timestamp);
      point[s.seriesName] = match?.value ?? null;
    });
    return point;
  });

  const colors = [
    "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
    "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
    "#bcbd22", "#17becf",
  ];

  return (
    <div className="border rounded-md p-4 bg-card text-card-foreground mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(v) =>
              new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
            minTickGap={40}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((s, i) => (
            <Line
              key={s.seriesName}
              type="monotone"
              dataKey={s.seriesName}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
          <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
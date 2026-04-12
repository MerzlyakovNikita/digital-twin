import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface Point {
  x: number;
  y: number;
}

interface Props {
  data: Point[];
  xName: string;
  yName: string;
}

const formatNumber = (value: number) => {
  if (Math.abs(value) >= 100000) {
    return value.toExponential(1);
  }
  return value.toString();
};

const formatValue = (v: number) => {
  if (!isFinite(v)) return "∞";
  if (Math.abs(v) >= 1000) return v.toExponential(2);
  return Number(v.toFixed(3));
};

const CustomTooltip = ({ active, payload, label, xName, yName }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: "#1f2937",
        border: "1px solid #374151",
        borderRadius: 8,
        padding: "8px 10px",
        color: "#e5e7eb",
        fontSize: 12,
      }}
    >
      <div style={{ color: "#9ca3af" }}>
        {xName}: {formatValue(label)}
      </div>

      <div style={{ color: "#3b82f6", fontWeight: 500 }}>
        {yName}: {formatValue(payload[0].value)}
      </div>
    </div>
  );
};

export default function Graph({ data, xName, yName }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          tickFormatter={formatNumber}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickCount={6}
          width={40}
        />
        <Tooltip content={<CustomTooltip xName={xName} yName={yName}/>} />
        <Line type="monotone" dataKey="y" stroke="#3b82f6" dot={false} />
        <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={1.5} />
        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}
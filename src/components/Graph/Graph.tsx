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
import { memo, useState, useRef, useEffect } from "react";

type Point = {
  x: number;
  y: number | null;
};

interface Props {
  data: Point[];
  xName: string;
  yName: string;
}

const LIMIT_X = 1000;
const LIMIT_Y = 1000;
const MIN_RANGE = 0.1;

const clampDomain = (
  [min, max]: [number, number],
  limit: number,
): [number, number] => {
  const range = max - min;

  if (range < MIN_RANGE) {
    const center = (min + max) / 2;

    min = center - MIN_RANGE / 2;
    max = center + MIN_RANGE / 2;
  }

  min = Math.max(min, -limit);
  max = Math.min(max, limit);

  return [min, max];
};

const formatNumber = (value: number) => {
  if (!isFinite(value)) return "";

  const abs = Math.abs(value);

  if (abs >= 100000) return value.toExponential(1);

  if (abs < 0.001 && abs !== 0) return value.toExponential(1);

  return Number(value.toFixed(2)).toString();
};

const formatValue = (v: number) => {
  if (v === null) return "—";
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

function Graph({ data, xName, yName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [xDomain, setXDomain] = useState<[number, number]>([-10, 10]);
  const [yDomain, setYDomain] = useState<[number, number]>([-10, 10]);

  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 1) return;
    e.preventDefault();

    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const stopDrag = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    lastPos.current = { x: e.clientX, y: e.clientY };

    const width = containerRef.current?.clientWidth ?? 300;
    const height = containerRef.current?.clientHeight ?? 260;

    const xScale = (xDomain[1] - xDomain[0]) / width;
    const yScale = (yDomain[1] - yDomain[0]) / height;

    const shiftX = dx * xScale;
    const shiftY = dy * yScale;

    setXDomain(
      clampDomain([xDomain[0] - shiftX, xDomain[1] - shiftX], LIMIT_X),
    );

    setYDomain(
      clampDomain([yDomain[0] + shiftY, yDomain[1] + shiftY], LIMIT_Y),
    );
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      const zoomFactor = 0.1;

      const xRange = xDomain[1] - xDomain[0];
      const yRange = yDomain[1] - yDomain[0];

      const delta = e.deltaY > 0 ? 1 + zoomFactor : 1 - zoomFactor;

      const xCenter = (xDomain[0] + xDomain[1]) / 2;
      const yCenter = (yDomain[0] + yDomain[1]) / 2;

      const newXRange = xRange * delta;
      const newYRange = yRange * delta;

      setXDomain(
        clampDomain(
          [xCenter - newXRange / 2, xCenter + newXRange / 2],
          LIMIT_X,
        ),
      );

      setYDomain(
        clampDomain(
          [yCenter - newYRange / 2, yCenter + newYRange / 2],
          LIMIT_Y,
        ),
      );
    };

    el.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      el.removeEventListener("wheel", wheelHandler);
    };
  }, [xDomain, yDomain]);

  const handleDoubleClick = () => {
    setXDomain([-10, 10]);
    setYDomain([-10, 10]);
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: 260,
          cursor: isDragging ? "grabbing" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      >
        <ResponsiveContainer
          width="100%"
          height={260}
          minWidth={200}
          minHeight={200}
        >
          <LineChart data={data}>
            <CartesianGrid stroke="#374151" strokeDasharray="3 3" />

            <XAxis
              dataKey="x"
              type="number"
              domain={[xDomain[0], xDomain[1]]}
              allowDataOverflow={true}
              tickFormatter={formatNumber}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />

            <YAxis
              type="number"
              domain={[yDomain[0], yDomain[1]]}
              allowDataOverflow={true}
              tickFormatter={formatNumber}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              width={60}
            />

            <Tooltip content={<CustomTooltip xName={xName} yName={yName} />} />

            <Line
              type="linear"
              dataKey="y"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />

            <ReferenceLine x={0} stroke="#9ca3af" />
            <ReferenceLine y={0} stroke="#9ca3af" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          color: "#9ca3af",
          textAlign: "center",
        }}
      >
        Колесо — масштаб | Средняя кнопка — перемещение | Двойной клик — сброс
      </div>
    </div>
  );
}

export default memo(Graph);

import { useState, useMemo, useEffect } from "react";
import type { Node } from "../../types/node";
import type { Edge } from "../../types/edge";
import {
  buildFormulas,
  buildExpandedFormula,
} from "../../utils/formula";
import { evaluate } from "../../utils/evaluate";
import Graph from "../Graph/Graph";

interface Props {
  nodes: Node[];
  edges: Edge[];
  values: Record<string, number>;
}

export default function ResultPanel({
  nodes,
  edges,
  values,
}: Props) {
  const variableNodes = nodes.filter(
    (n) => n.type === "variable"
  );

  const yNodes = nodes.filter(
    (n) => n.type === "operation" || n.type === "function"
  );

  const [xNodeId, setXNodeId] = useState<string | null>(null);
  const [yNodeId, setYNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!xNodeId && variableNodes.length > 0) {
      setXNodeId(variableNodes[0].id);
    }
  }, [variableNodes, xNodeId]);

  useEffect(() => {
    if (!yNodeId && yNodes.length > 0) {
      setYNodeId(yNodes[yNodes.length - 1].id);
    }
  }, [yNodes, yNodeId]);

  const xNode = nodes.find((n) => n.id === xNodeId);
  const yNode = nodes.find((n) => n.id === yNodeId);

  const formulas = buildFormulas(nodes, edges);

  const expanded =
    yNodeId != null
      ? buildExpandedFormula(yNodeId, nodes, edges)
      : "";

  const data = useMemo(() => {
    if (!xNodeId || !yNodeId) return [];

    const result: { x: number; y: number }[] = [];

    for (let x = -10; x <= 10; x += 1) {
      const newValues = {
        ...values,
        [xNodeId]: x,
      };

      const y = evaluate(
        yNodeId,
        nodes,
        edges,
        newValues
      );

      result.push({ x, y });
    }

    return result;
  }, [xNodeId, yNodeId, values, nodes, edges]);

  return (
    <div className="sidebar right">
      <h3>Результат</h3>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: "#9ca3af" }}>
          Ось X
        </label>

        <select
          value={xNodeId ?? ""}
          onChange={(e) => setXNodeId(e.target.value)}
          style={selectStyle}
        >
          {variableNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "#9ca3af" }}>
          Ось Y
        </label>

        <select
          value={yNodeId ?? ""}
          onChange={(e) => setYNodeId(e.target.value)}
          style={selectStyle}
        >
          {yNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div className="formula">
        {Array.from(new Set(formulas)).map((f, i) => (
          <div key={i}>{f}</div>
        ))}
      </div>

      <div className="formula" style={{ marginTop: 10 }}>
        {expanded}
      </div>

      <div className="graph">
        {data.length > 0 && xNode && yNode && (
          <Graph
            data={data}
            xName={xNode.name}
            yName={yNode.name}
          />
        )}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 4,
  padding: 6,
  borderRadius: 6,
  background: "#1f2937",
  color: "white",
  border: "1px solid #374151",
};
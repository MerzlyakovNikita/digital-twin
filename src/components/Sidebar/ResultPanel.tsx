import { useState, useMemo, useEffect } from "react";
import type { Node } from "../../types/node";
import type { Edge } from "../../types/edge";
import { evaluate } from "../../utils/evaluate";
import Graph from "../Graph/Graph";
import { evaluateWithTrace } from "../../utils/evaluateTrace";

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
        <label className="section-title">Ось X</label>

        <select
          value={xNodeId ?? ""}
          onChange={(e) => setXNodeId(e.target.value)}
        >
          {variableNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label className="section-title">Ось Y</label>

        <select
          value={yNodeId ?? ""}
          onChange={(e) => setYNodeId(e.target.value)}
        >
          {yNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>
      
      <h4 className="section-title">Пошаговые вычисления</h4>
      <div className="formula">
        {yNodes.map((node) => {
          const trace = evaluateWithTrace(
            node.id,
            nodes,
            edges,
            values
          );

          return (
            <div key={node.id}>
              {node.name} = {trace.expr} = {trace.substituted} = {trace.result}
            </div>
          );
        })}
      </div>

      <h4 className="section-title">Итоговая функция</h4>
      <div className="formula" style={{ marginTop: 10 }}>
        {yNodeId && (() => {
          const trace = evaluateWithTrace(
            yNodeId,
            nodes,
            edges,
            values
          );

          return (
            <div>
              {yNode?.name} = {trace.expr} = {trace.substituted} = {trace.result}
            </div>
          );
        })()}
      </div>

      <h4 className="section-title">График зависимости</h4>
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
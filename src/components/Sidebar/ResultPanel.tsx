import { useState, useMemo, useEffect } from "react";
import type { Node } from "../../types/node";
import type { Edge } from "../../types/edge";
import { evaluate } from "../../utils/evaluate";
import Graph from "../Graph/Graph";
import { evaluateWithTrace } from "../../utils/evaluateTrace";
import { buildInverseFormula, hasForwardPath } from "../../utils/inverse";

interface Props {
  nodes: Node[];
  edges: Edge[];
  values: Record<string, number>;
}

export default function ResultPanel({ nodes, edges, values }: Props) {
  const allNodes = nodes;

  const [xNodeId, setXNodeId] = useState<string | null>(null);
  const [yNodeId, setYNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (!xNodeId && allNodes.length > 0) {
      setXNodeId(allNodes[0].id);
    }
  }, [allNodes, xNodeId]);

  useEffect(() => {
    if (!yNodeId && allNodes.length > 0) {
      setYNodeId(allNodes[allNodes.length - 1].id);
    }
  }, [allNodes, yNodeId]);

  const xNode = nodes.find((n) => n.id === xNodeId);
  const yNode = nodes.find((n) => n.id === yNodeId);

  const data = useMemo(() => {
    if (!xNodeId || !yNodeId || !xNode || !yNode) {
      return {
        first: [],
        second: [],
      };
    }

    const result1: {
      x: number;
      y: number | null;
    }[] = [];

    const result2: {
      x: number;
      y: number | null;
    }[] = [];

    const isForward = hasForwardPath(xNode.id, yNode.id, edges);

    let min = -20;
    let max = 20;
    let step = 0.2;

    if (yNode.type === "function") {
      if (["sin", "cos", "tan"].includes(yNode.func)) {
        min = -Math.PI * 5;
        max = Math.PI * 5;
        step = 0.05;
      }
    }

    if (xNode.type === "function") {
      if (["sin", "cos"].includes(xNode.func)) {
        min = -1;
        max = 1;
        step = 0.02;
      }
    }

    const round = (v: number) => {
      if (Math.abs(v) < 0.001) {
        return Number(v.toExponential(3));
      }

      return Math.round(v * 1000) / 1000;
    };

    if (isForward) {
      for (let x = min; x <= max; x += step) {
        const newValues = {
          ...values,
          [xNodeId]: x,
        };

        const y = evaluate(yNodeId, nodes, edges, newValues, xNodeId, x);

        const roundedY = !isNaN(y) && isFinite(y) ? round(y) : null;

        const prev = result1[result1.length - 1];

        if (
          prev &&
          prev.y !== null &&
          roundedY !== null &&
          Math.abs(prev.y - roundedY) > 20
        ) {
          result1.push({
            x: round(x),
            y: null,
          });
        }

        result1.push({
          x: round(x),
          y: roundedY,
        });
      }

      return {
        first: result1,
        second: result2,
      };
    }

    const inverse = buildInverseFormula(yNode.id, xNode.id, nodes, edges);
    if (!inverse.ok) {
      return {
        first: [],
        second: [],
      };
    }

    const compiledExprs = inverse.exprs.map((expr) => {
      let jsExpr = expr
        .replaceAll("^", "**")
        .replace(/arcsin/g, "Math.asin")
        .replace(/arccos/g, "Math.acos")
        .replace(/arctan/g, "Math.atan")
        .replace(/abs\(/g, "(")
        .replace(/ln/g, "Math.log")
        .replace(/exp/g, "Math.exp")
        .replace(/pow\(([^,]+),([^)]+)\)/g, "Math.pow($1,$2)")
        .replace(/root\(([^,]+),([^)]+)\)/g, "Math.pow($1, 1/$2)");

      nodes.forEach((node) => {
        const regex = new RegExp(`\\b${node.name}\\b`, "g");

        if (node.id === xNode.id) {
          jsExpr = jsExpr.replace(regex, "x");
        } else {
          const val = evaluate(node.id, nodes, edges, values);

          jsExpr = jsExpr.replace(regex, String(val));
        }
      });

      return Function(
        "add",
        "sub",
        "mul",
        "div",
        "x",
        `"use strict"; return (${jsExpr})`,
      );
    });

    inverse.exprs.forEach((expr, exprIndex) => {
      const fn = compiledExprs[exprIndex];

      const currentResult = exprIndex === 0 ? result1 : result2;

      for (let x = min; x <= max; x += step) {
        const y = fn(
          (a: number, b: number) => a + b,
          (a: number, b: number) => a - b,
          (a: number, b: number) => a * b,
          (a: number, b: number) => a / b,
          x,
        );

        const roundedY = !isNaN(y) && isFinite(y) ? round(y) : null;

        const prev = currentResult[currentResult.length - 1];

        if (
          prev &&
          prev.y !== null &&
          roundedY !== null &&
          Math.abs(prev.y - roundedY) > 20
        ) {
          currentResult.push({
            x: round(x),
            y: null,
          });
        }

        currentResult.push({
          x: round(x),
          y: roundedY,
        });
      }
    });

    return {
      first: result1,
      second: result2,
    };
  }, [xNodeId, yNodeId, values, nodes, edges, xNode, yNode]);

  const sortedNodes = [...allNodes].sort((a, b) => {
    if (a.type === "variable" && b.type !== "variable") return -1;
    if (a.type !== "variable" && b.type === "variable") return 1;
    return 0;
  });

  return (
    <div className="sidebar right">
      <h3>Результат</h3>

      <div style={{ marginBottom: 10 }}>
        <label className="section-title">Исходное (Ось X)</label>

        <select
          value={xNodeId ?? ""}
          onChange={(e) => setXNodeId(e.target.value)}
        >
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="section-title">Найти (Ось Y)</label>

        <select
          value={yNodeId ?? ""}
          onChange={(e) => setYNodeId(e.target.value)}
        >
          {allNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <h4 className="section-title">Пошаговые вычисления</h4>
      <div className="formula">
        {sortedNodes.map((node) => {
          const trace = evaluateWithTrace(node.id, nodes, edges, values);

          if (node.type === "variable") {
            return (
              <div key={node.id}>
                {node.name} = {trace.result}
              </div>
            );
          }

          return (
            <div key={node.id}>
              {node.name} = {trace.expr} = {trace.substituted} = {trace.result}
            </div>
          );
        })}
      </div>

      <h4 className="section-title">Итоговая функция</h4>
      <div className="formula">
        {yNodeId &&
          xNodeId &&
          (() => {
            if (!xNode || !yNode) return null;

            const isForward = hasForwardPath(xNode.id, yNode.id, edges);

            if (isForward) {
              const trace = evaluateWithTrace(yNodeId, nodes, edges, values);

              if (yNode.type === "variable") {
                return (
                  <div>
                    {yNode.name} = {trace.result}
                  </div>
                );
              }

              return (
                <div>
                  {yNode.name} = {trace.expr} = {trace.substituted} ={" "}
                  {trace.result}
                </div>
              );
            }

            const inverse = buildInverseFormula(
              yNode.id,
              xNode.id,
              nodes,
              edges,
            );

            if (!inverse.ok) {
              return <div>{inverse.reason}</div>;
            }

            return (
              <>
                {inverse.exprs.map((expr, index) => (
                  <div key={index}>
                    {yNode.name} = {expr}
                  </div>
                ))}
              </>
            );
          })()}
      </div>

      <h4 className="section-title">График зависимости</h4>
      <div className="graph">
        {data.first.length > 0 && xNode && yNode && (
          <Graph data={data} xName={xNode.name} yName={yNode.name} />
        )}
      </div>
    </div>
  );
}

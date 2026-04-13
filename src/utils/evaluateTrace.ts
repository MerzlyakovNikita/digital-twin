import type { Node } from "../types/node";
import type { Edge } from "../types/edge";

const opMap: Record<string, string> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
};

const opSymbol: Record<string, string> = {
  "+": "+",
  "-": "-",
  "*": "*",
  "/": "/",
};

export function evaluateWithTrace(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  values: Record<string, number>
) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  function dfs(id: string): {
    expr: string;
    substituted: string;
    value: number;
  } {
    const node = nodeMap[id];
    if (!node) {
      return {
        expr: "?",
        substituted: "?",
        value: 0,
      };
    }

    if (node.type === "variable") {
      const val = values[id] ?? 0;
      return {
        expr: node.name,
        substituted: val.toString(),
        value: val,
      };
    }

    if (node.type === "function") {
        const input = edges.find(e => e.to === id);
        if (!input) return { expr: node.name, substituted: "?", value: 0 };

        const inner = dfs(input.from);

        let result = 0;
        let expr = "";
        let substituted = "";

        const param = Number(node.param ?? 2);

        switch (node.func) {
            case "pow":
                expr = `pow(${inner.expr}, ${param})`;
                substituted = `(${inner.substituted})^${param}`;
                result = Math.pow(inner.value, param);
            break;

            case "root":
                expr = `pow(${inner.expr}, ${param})`;
                substituted = `(${inner.substituted})^${param}`;
                result = Math.pow(inner.value, 1 / param);
            break;

            default:
                expr = `${node.func}(${inner.expr})`;
                substituted = `${node.func}(${inner.substituted})`;

            switch (node.func) {
                case "sin": result = Math.sin(inner.value); break;
                case "cos": result = Math.cos(inner.value); break;
                case "tan": result = Math.tan(inner.value); break;
                case "log": result = Math.log(inner.value); break;
                case "exp": result = Math.exp(inner.value); break;
                case "abs": result = Math.abs(inner.value); break;
            }
        }

        return {
            expr,
            substituted,
            value: result,
        };
    }

    const inputs = edges
      .filter(e => e.to === id)
      .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0));

    if (inputs.length < 2) {
      return { expr: node.name, substituted: "?", value: 0 };
    }

    const left = dfs(inputs[0].from);
    const right = dfs(inputs[1].from);

    let result = 0;

    switch (node.operation) {
      case "+": result = left.value + right.value; break;
      case "-": result = left.value - right.value; break;
      case "*": result = left.value * right.value; break;
      case "/": result = right.value !== 0 ? left.value / right.value : 0; break;
    }

    return {
      expr: `${opMap[node.operation]}(${left.expr}, ${right.expr})`,

      substituted: `${left.substituted} ${opSymbol[node.operation]} ${right.substituted}`,

      value: result,
    };
  }

  const res = dfs(nodeId);

  return {
    expr: res.expr,
    substituted: res.substituted,
    result: Number(res.value.toFixed(4)),
  };
}
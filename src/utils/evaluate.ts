import type { Node } from "../types/node";
import type { Edge } from "../types/edge";

export function evaluate(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  values: Record<string, number>
): number {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  function dfs(id: string): number {
    const node = nodeMap[id];

    if (node.type === "variable") {
      return values[id] ?? 0;
    }

    if (node.type === "function") {
      const input = edges.find(e => e.to === id);
      if (!input) return 0;

      const v = dfs(input.from);

      switch (node.func) {
        case "sin": return Math.sin(v);
        case "cos": return Math.cos(v);
        case "tan": return Math.tan(v);
        case "log": return Math.log(v);
        case "exp": return Math.exp(v);
        case "sqrt": return Math.sqrt(v);
        case "abs": return Math.abs(v);
        default: return 0;
      }
    }

    const inputs = edges
      .filter(e => e.to === id)
      .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0));

    if (inputs.length < 2) return 0;

    const a = dfs(inputs[0].from);
    const b = dfs(inputs[1].from);

    switch (node.operation) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      default: return 0;
    }
  }

  return dfs(nodeId);
}
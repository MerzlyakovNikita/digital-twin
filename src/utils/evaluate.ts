import type { Node } from "../types/node";
import type { Edge } from "../types/edge";

export function evaluate(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  values: Record<string, number>,
  overrideId?: string,
  overrideValue?: number,
): number {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function dfs(id: string): number {
    const node = nodeMap[id];
    if (!node) return 0;

    if (overrideId && id === overrideId && overrideValue !== undefined) {
      return overrideValue;
    }

    if (node.type === "variable") {
      return values[id] ?? 0;
    }

    if (node.type === "function") {
      const input = edges.find((e) => e.to === id);
      if (!input) return 0;

      const v = dfs(input.from);

      const param = Number(node.param ?? 2);

      if (v <= 0 || param <= 0 || param === 1) return NaN;

      switch (node.func) {
        case "sin":
          return Math.sin(v);
        case "cos":
          return Math.cos(v);
        case "tan":
          return Math.tan(v);
        case "log":
          return Math.log(v) / Math.log(param);
        case "ln":
          return Math.log(v);
        case "exp":
          return Math.exp(v);
        case "abs":
          return Math.abs(v);
        case "pow":
          return Math.pow(v, param);
        case "root":
          return Math.pow(v, 1 / param);
        case "one":
          return v >= 0 ? 1 : 0;
        case "sign":
          return v > 0 ? 1 : v < 0 ? -1 : 0;
        default:
          return 0;
      }
    }

    const inputs = edges
      .filter((e) => e.to === id)
      .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0));

    if (inputs.length < 2) return 0;

    const a = dfs(inputs[0].from);
    const b = dfs(inputs[1].from);

    switch (node.operation) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b !== 0 ? a / b : 0;
      default:
        return 0;
    }
  }

  return dfs(nodeId);
}

import type { Node } from "../types/node";
import type { Edge } from "../types/edge";

type StepResult = { ok: true; expr: string } | { ok: false; reason: string };

type PathStep = {
  node: Node;
  inputIndex: number;
};

const getNode = (nodes: Node[], id: string) => nodes.find((n) => n.id === id);

const getInputs = (nodeId: string, nodes: Node[], edges: Edge[]) => {
  return edges
    .filter((e) => e.to === nodeId)
    .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0))
    .map((e) => getNode(nodes, e.from)!);
};

function findReversePath(
  startId: string,
  targetId: string,
  nodes: Node[],
  edges: Edge[],
): PathStep[] | null {
  const queue = [{ id: startId, path: [] as PathStep[] }];
  const visited = new Set<string>();

  while (queue.length) {
    const { id, path } = queue.shift()!;

    if (id === targetId) return path;

    if (visited.has(id)) continue;
    visited.add(id);

    edges
      .filter((e) => e.from === id)
      .forEach((e) => {
        const node = nodes.find((n) => n.id === e.to);
        if (!node) return;

        queue.push({
          id: e.to,
          path: [...path, { node, inputIndex: e.inputIndex ?? 0 }],
        });
      });
  }

  return null;
}

function invertStep(
  node: Node,
  currentExpr: string,
  inputIndex: number,
  inputs: Node[],
): StepResult {
  if (node.type === "operation") {
    const a = inputs[0]?.name ?? "?";
    const b = inputs[1]?.name ?? "?";

    switch (node.operation) {
      case "+":
        return {
          ok: true,
          expr:
            inputIndex === 0
              ? `sub(${currentExpr}, ${b})`
              : `sub(${currentExpr}, ${a})`,
        };

      case "-":
        return {
          ok: true,
          expr:
            inputIndex === 0
              ? `add(${currentExpr}, ${b})`
              : `sub(${a}, ${currentExpr})`,
        };

      case "*":
        return {
          ok: true,
          expr:
            inputIndex === 0
              ? `div(${currentExpr}, ${b})`
              : `div(${currentExpr}, ${a})`,
        };

      case "/":
        return {
          ok: true,
          expr:
            inputIndex === 0
              ? `mul(${currentExpr}, ${b})`
              : `div(${a}, ${currentExpr})`,
        };
    }
  }

  if (node.type === "function") {
    switch (node.func) {
      case "sin":
        return { ok: true, expr: `arcsin(${currentExpr})` };

      case "cos":
        return { ok: true, expr: `arccos(${currentExpr})` };

      case "tan":
        return { ok: true, expr: `arctan(${currentExpr})` };

      case "log":
        return { ok: true, expr: `pow(${node.param}, ${currentExpr})` };

      case "ln":
        return { ok: true, expr: `exp(${currentExpr})` };

      case "exp":
        return { ok: true, expr: `ln(${currentExpr})` };

      case "pow":
        return { ok: true, expr: `root(${currentExpr}, ${node.param})` };

      case "root":
        return { ok: true, expr: `pow(${currentExpr}, ${node.param})` };

      case "abs":
      case "one":
      case "sign":
        return {
          ok: false,
          reason: `Функция '${node.func}' не имеет однозначной обратной`,
        };
    }
  }

  return { ok: false, reason: "Не удалось инвертировать узел" };
}

export function buildInverseFormula(
  targetId: string,
  givenId: string,
  nodes: Node[],
  edges: Edge[],
): StepResult {
  const path = findReversePath(targetId, givenId, nodes, edges);

  if (!path) {
    return { ok: false, reason: "Нет пути между выбранными узлами" };
  }

  let expr = getNode(nodes, givenId)?.name ?? "X";

  for (const step of path.reverse()) {
    const inputs = getInputs(step.node.id, nodes, edges);

    const res = invertStep(step.node, expr, step.inputIndex, inputs);

    if (!res.ok) return res;

    expr = res.expr;
  }

  return { ok: true, expr };
}

export const hasForwardPath = (fromId: string, toId: string, edges: Edge[]) => {
  const visited = new Set<string>();
  const stack = [fromId];

  while (stack.length) {
    const current = stack.pop()!;

    if (current === toId) return true;

    if (visited.has(current)) continue;
    visited.add(current);

    edges.filter((e) => e.from === current).forEach((e) => stack.push(e.to));
  }

  return false;
};

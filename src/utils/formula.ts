import type { Node } from "../types/node";
import type { Edge } from "../types/edge";

type OpMap = {
  [key: string]: string;
};

const opMap: OpMap = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
};

export function buildFormulas(nodes: Node[], edges: Edge[]) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  function getInputs(nodeId: string) {
    return edges
      .filter(e => e.to === nodeId)
      .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0))
      .map(e => nodeMap[e.from]);
  }

  const formulas: string[] = [];

  for (const node of nodes) {
    if (node.type === "operation") {
      const inputs = getInputs(node.id);
      if (inputs.length < 2) continue;

      const left = inputs[0].name;
      const right = inputs[1].name;

      const op = opMap[node.operation];

      formulas.push(`${node.name} = ${op}(${left}, ${right})`);
    }

    // 👉 ФУНКЦИИ
    if (node.type === "function") {
      const inputEdge = edges.find(e => e.to === node.id);
      if (!inputEdge) continue;

      const inputNode = nodeMap[inputEdge.from];

      formulas.push(`${node.name} = ${node.func}(${inputNode.name})`);
    }
  }

  return formulas;
}

export function buildExpandedFormula(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): string {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  function dfs(id: string): string {
    const node = nodeMap[id];

    if (node.type === "variable") return node.name;

    if (node.type === "function") {
      const input = edges.find(e => e.to === id);
      if (!input) return node.name;

      return `${node.func}(${dfs(input.from)})`;
    }

    const inputs = edges
      .filter(e => e.to === id)
      .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0));

    if (inputs.length < 2) return node.name;

    const left = dfs(inputs[0].from);
    const right = dfs(inputs[1].from);

    return `${opMap[node.operation]}(${left}, ${right})`;
  }

  const root = nodes.find(n => n.id === nodeId);
  if (!root) return "";

  return `${root.name} = ${dfs(nodeId)}`;
}

export function findRoot(nodes: Node[], edges: Edge[]) {
  const hasOutput = new Set(edges.map(e => e.from));

  return nodes.find(n => !hasOutput.has(n.id) && n.type === "operation");
}
import type { Node } from "../types/node";
import type { Edge } from "../types/edge";

export const sampleTemplate = {
  nodes: [
    { id: "x", type: "variable", name: "x", x: 100, y: 100 },
    { id: "y", type: "variable", name: "y", x: 100, y: 200 },

    {
      id: "add1",
      type: "operation",
      name: "z",
      operation: "+",
      x: 300,
      y: 150,
    },

    { id: "cos1", type: "function", name: "F", func: "cos", x: 500, y: 150 },
  ] as Node[],

  edges: [
    { id: "e1", from: "x", to: "add1", inputIndex: 0 },
    { id: "e2", from: "y", to: "add1", inputIndex: 1 },
    { id: "e3", from: "add1", to: "cos1" },
  ] as Edge[],
};

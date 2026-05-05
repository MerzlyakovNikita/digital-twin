import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Node, OperationType, FunctionType } from "../types/node";
import type { Edge } from "../types/edge";
import { sampleTemplate } from "./templates";

export function useGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [connecting, setConnecting] = useState<{
    fromNodeId: string;
  } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [variableValues, setVariableValues] = useState<Record<string, number>>(
    {},
  );

  const saveGraph = () => {
    const data = {
      nodes,
      edges,
      values: variableValues,
    };

    localStorage.setItem("graph", JSON.stringify(data));
    alert("Схема сохранена");
  };

  const loadSavedGraph = () => {
    const saved = localStorage.getItem("graph");

    if (!saved) {
      alert("Нет сохранённой схемы");
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      setNodes(parsed.nodes ?? []);
      setEdges(parsed.edges ?? []);
      setVariableValues(parsed.values ?? {});
    } catch {
      alert("Ошибка загрузки данных");
    }
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  const loadTemplate = () => {
    setNodes(sampleTemplate.nodes);
    setEdges(sampleTemplate.edges);
  };

  const setVariableValue = (id: string, value: number) => {
    setVariableValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const addVariable = (name: string) => {
    const id = uuidv4();

    const offset = nodes.length * 30;

    setNodes((prev) => [
      ...prev,
      {
        id,
        type: "variable",
        name,
        x: 100 + offset,
        y: 100 + offset,
      },
    ]);

    setVariableValues((prev) => ({
      ...prev,
      [id]: 0,
    }));
  };

  const addOperation = (name: string) => {
    const offset = nodes.length * 30;

    setNodes((prev) => [
      ...prev,
      {
        id: uuidv4(),
        type: "operation",
        name,
        operation: "+",
        x: 120 + offset,
        y: 120 + offset,
      },
    ]);
  };

  const addFunction = (name: string) => {
    const id = uuidv4();
    const offset = nodes.length * 30;

    setNodes((prev) => [
      ...prev,
      {
        id,
        type: "function",
        name,
        func: "sin",
        x: 120 + offset,
        y: 120 + offset,
      },
    ]);
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  };

  const updateMousePosition = (x: number, y: number) => {
    setMousePos({ x, y });
  };

  const startConnection = (nodeId: string) => {
    setConnecting({ fromNodeId: nodeId });
  };

  const finishConnection = (toNodeId: string, inputIndex?: 0 | 1) => {
    if (!connecting) return;

    const fromId = connecting.fromNodeId;

    setEdges((prev) => {
      let newEdges = [...prev];

      const targetNode = nodes.find((n) => n.id === toNodeId);

      newEdges = newEdges.filter(
        (e) => !(e.from === fromId && e.to === toNodeId),
      );

      if (targetNode?.type === "operation" && inputIndex !== undefined) {
        newEdges = newEdges.filter(
          (e) => !(e.to === toNodeId && e.inputIndex === inputIndex),
        );
      }

      if (targetNode?.type === "function") {
        newEdges = newEdges.filter((e) => e.to !== toNodeId);
      }

      newEdges.push({
        id: uuidv4(),
        from: connecting.fromNodeId,
        to: toNodeId,
        inputIndex,
      });

      return newEdges;
    });

    setConnecting(null);
    setMousePos(null);
  };

  const removeEdge = (id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  };

  const cancelConnection = () => {
    setConnecting(null);
    setMousePos(null);
  };

  const updateNodeOperation = (id: string, op: OperationType) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === id && node.type === "operation") {
          return {
            ...node,
            operation: op,
          };
        }
        return node;
      }),
    );
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));

    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
  };

  const updateNodeFunction = (id: string, func: FunctionType) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id && n.type === "function" ? { ...n, func } : n,
      ),
    );
  };

  const updateNodeParam = (id: string, param: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id && n.type === "function" ? { ...n, param } : n,
      ),
    );
  };

  return {
    nodes,
    edges,
    addVariable,
    addOperation,
    updatePosition,
    startConnection,
    finishConnection,
    removeEdge,
    connecting,
    mousePos,
    updateMousePosition,
    cancelConnection,
    updateNodeOperation,
    removeNode,
    variableValues,
    setVariableValue,
    addFunction,
    updateNodeFunction,
    updateNodeParam,
    clearCanvas,
    loadTemplate,
    saveGraph,
    loadSavedGraph,
  };
}

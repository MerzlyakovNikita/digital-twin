import { useState, useRef } from "react";
import type { Node, OperationType, FunctionType } from "../../types/node";
import type { Edge } from "../../types/edge";
import DraggableNode from "./DraggableNode";

function buildExpr(nodeId: string, nodes: Node[], edges: Edge[]): string {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function dfs(id: string): string {
    const node = nodeMap[id];
    if (!node) return "?";

    if (node.type === "variable") return node.name;

    if (node.type === "function") {
      const input = edges.find((e) => e.to === id);
      if (!input) return node.name;

      const inner = dfs(input.from);

      if (node.func === "pow") return `pow(${inner}, ${node.param})`;
      if (node.func === "root") return `root(${inner}, ${node.param})`;
      if (node.func === "log") return `log(${inner}, ${node.param})`;

      return `${node.func}(${inner})`;
    }

    const inputs = edges
      .filter((e) => e.to === id)
      .sort((a, b) => (a.inputIndex ?? 0) - (b.inputIndex ?? 0));

    if (inputs.length < 2) return node.name;

    const left = dfs(inputs[0].from);
    const right = dfs(inputs[1].from);

    const opMap: Record<string, string> = {
      "+": "add",
      "-": "sub",
      "*": "mul",
      "/": "div",
    };

    return `${opMap[node.operation]}(${left}, ${right})`;
  }

  return dfs(nodeId);
}

const shorten = (s: string) => (s.length > 20 ? s.slice(0, 20) + "..." : s);

interface Props {
  nodes: Node[];
  edges: Edge[];
  updatePosition: (id: string, x: number, y: number) => void;
  startConnection: (id: string) => void;
  finishConnection: (id: string) => void;
  removeEdge: (id: string) => void;
  connecting: { fromNodeId: string } | null;
  mousePos: { x: number; y: number } | null;
  updateMousePosition: (x: number, y: number) => void;
  cancelConnection: () => void;
  updateNodeOperation?: (id: string, op: OperationType) => void;
  removeNode: (id: string) => void;
  updateNodeFunction?: (id: string, func: FunctionType) => void;
  updateNodeParam?: (id: string, param: string) => void;
  clearCanvas: () => void;
}

export default function Canvas(props: Props) {
  const {
    nodes,
    edges,
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
    updateNodeFunction,
    updateNodeParam,
  } = props;

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const last = useRef({ x: 0, y: 0 });

  const zoomPercent = Math.round(scale * 100);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
  };

  return (
    <div
      className="canvas"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : "default",
      }}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();

          setIsPanning(true);

          last.current = {
            x: e.clientX,
            y: e.clientY,
          };

          return;
        }

        if ((e.target as HTMLElement).closest(".node") === null) {
          cancelConnection();
        }
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        updateMousePosition(
          (e.clientX - rect.left - offset.x) / scale,
          (e.clientY - rect.top - offset.y) / scale,
        );

        if (!isPanning) return;

        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;

        last.current = {
          x: e.clientX,
          y: e.clientY,
        };

        setOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }}
      onMouseUp={() => setIsPanning(false)}
      onMouseLeave={() => setIsPanning(false)}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 8,
          zIndex: 1000,
        }}
      >
        <button onClick={zoomIn} style={btnStyle}>
          +
        </button>

        <div
          style={{
            padding: "6px 0px",
            minWidth: 50,
            textAlign: "center",
            fontSize: 13,
            color: "#374151",
            userSelect: "none",
          }}
        >
          {zoomPercent}%
        </div>

        <button onClick={zoomOut} style={btnStyle}>
          −
        </button>

        <button onClick={resetView} style={btnStyle}>
          Сбросить положение
        </button>

        <button
          onClick={props.clearCanvas}
          style={{
            ...btnStyle,
            background: "#ef4444",
          }}
        >
          Очистить
        </button>
      </div>

      <div
        className="viewport"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          transform: `
            translate(${offset.x}px, ${offset.y}px)
            scale(${scale})
          `,
          transformOrigin: "0 0",
        }}
      >
        <svg
          className="edges"
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
          }}
        >
          {edges.map((edge) => {
            const from = nodes.find((n) => n.id === edge.from);
            const to = nodes.find((n) => n.id === edge.to);

            if (!from || !to) return null;

            const NODE_WIDTH = 127;
            const NODE_HEIGHT = 72;

            const p1 = {
              x: from.x + NODE_WIDTH,
              y: from.y + NODE_HEIGHT / 2,
            };

            let p2;

            if (to.type === "operation") {
              p2 = {
                x: to.x,
                y:
                  edge.inputIndex === 0
                    ? to.y + NODE_HEIGHT * 0.3
                    : to.y + NODE_HEIGHT * 0.7,
              };
            } else {
              p2 = {
                x: to.x,
                y: to.y + NODE_HEIGHT / 2,
              };
            }

            if (!p1 || !p2) return null;

            const x1 = p1.x;
            const y1 = p1.y;

            const x2 = p2.x;
            const y2 = p2.y;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const label = shorten(buildExpr(edge.from, nodes, edges));

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="black"
                  strokeWidth={2}
                />

                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={10}
                  style={{
                    cursor: "pointer",
                    pointerEvents: "stroke",
                  }}
                  onClick={() => removeEdge(edge.id)}
                />

                <text
                  x={midX}
                  y={midY - 12}
                  fill="gray"
                  fontSize={12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  {label}
                  <title>{buildExpr(edge.from, nodes, edges)}</title>
                </text>
              </g>
            );
          })}

          {connecting &&
            mousePos &&
            (() => {
              const from = nodes.find((n) => n.id === connecting.fromNodeId);

              if (!from) return null;

              const NODE_WIDTH = 127;
              const NODE_HEIGHT = 72;

              const x1 = from.x + NODE_WIDTH;
              const y1 = from.y + NODE_HEIGHT / 2;

              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={mousePos.x}
                  y2={mousePos.y}
                  stroke="gray"
                  strokeDasharray="5,5"
                  strokeWidth={2}
                />
              );
            })()}
        </svg>

        {nodes.map((node) => (
          <DraggableNode
            key={node.id}
            node={node}
            offset={offset}
            scale={scale}
            updatePosition={updatePosition}
            startConnection={startConnection}
            finishConnection={finishConnection}
            connecting={connecting}
            updateNodeOperation={updateNodeOperation}
            removeNode={removeNode}
            updateNodeFunction={updateNodeFunction}
            updateNodeParam={updateNodeParam}
          />
        ))}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 10px",
  background: "#374151",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};

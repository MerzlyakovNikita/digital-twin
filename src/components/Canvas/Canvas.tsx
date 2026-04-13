import type { Node, OperationType, FunctionType } from "../../types/node";
import type { Edge } from "../../types/edge";
import DraggableNode from "./DraggableNode";

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
}

function getPortPosition(id: string) {
  const el = document.getElementById(id);
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const canvasRect = document
    .querySelector(".canvas")!
    .getBoundingClientRect();

  return {
    x: rect.left - canvasRect.left + rect.width / 2,
    y: rect.top - canvasRect.top + rect.height / 2,
  };
}

export default function Canvas({
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
  updateNodeParam
}: Props) {
  return (
    <div
      className="canvas"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        updateMousePosition(
          e.clientX - rect.left,
          e.clientY - rect.top
        );
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(".node") === null) {
          cancelConnection();
        }
      }}
      style={{ position: "relative" }}
    >
      <svg
        className="edges"
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {edges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);

          if (!from || !to) return null;

          const p1 = getPortPosition(`port-out-${from.id}`);
          const p2 = getPortPosition(`port-in-${to.id}-${edge.inputIndex ?? 0}`);

          if (!p1 || !p2) return null;

          const x1 = p1.x;
          const y1 = p1.y;
          const x2 = p2.x;
          const y2 = p2.y;

          return (
            <g key={edge.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={2} />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="transparent"
                strokeWidth={10}
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onClick={() => removeEdge(edge.id)}
              />
            </g>
          );
        })}

        {connecting && mousePos && (() => {
          const from = nodes.find(n => n.id === connecting.fromNodeId);
          if (!from) return null;

          const p1 = getPortPosition(`port-out-${from.id}`);
          if (!p1) return null;

          return (
            <line
              x1={p1.x}
              y1={p1.y}
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
  );
}
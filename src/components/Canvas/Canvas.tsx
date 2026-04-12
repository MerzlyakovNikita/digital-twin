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
}

const NODE_WIDTH = 167;

const PORT_OFFSET_Y = {
  variable: 41,
  operation: [25, 57],
  function: 41,
};

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
  updateNodeFunction
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

          const x1 = from.x + NODE_WIDTH;
          const y1 = from.y + PORT_OFFSET_Y.variable;

          let y2 = to.y + PORT_OFFSET_Y.variable;

          if (to.type === "operation" && edge.inputIndex !== undefined) {
            y2 = to.y + PORT_OFFSET_Y.operation[edge.inputIndex];
          }

          if (to.type === "function") {
            y2 = to.y + PORT_OFFSET_Y.function;
          }

          const x2 = to.x - 1;

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

          return (
            <line
              x1={from.x + NODE_WIDTH}
              y1={from.y + PORT_OFFSET_Y.variable}
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
        />
      ))}
    </div>
  );
}
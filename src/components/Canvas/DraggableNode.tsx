import { useEffect, useState } from "react";
import type { Node, OperationType, FunctionType } from "../../types/node";

interface Props {
  node: Node;
  updatePosition: (id: string, x: number, y: number) => void;
  startConnection: (id: string) => void;
  finishConnection: (id: string, input: number) => void;
  connecting: { fromNodeId: string } | null;
  updateNodeOperation?: (id: string, op: OperationType) => void;
  removeNode: (id: string) => void;
  updateNodeFunction?: (id: string, func: FunctionType) => void;
}

export default function DraggableNode({
  node,
  updatePosition,
  startConnection,
  finishConnection,
  connecting,
  updateNodeOperation,
  removeNode,
  updateNodeFunction
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const isConnectingFromThis = connecting?.fromNodeId === node.id;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      const canvas = document.querySelector(".canvas") as HTMLElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      let x = e.clientX - rect.left - offset.x;
      let y = e.clientY - rect.top - offset.y;

      const NODE_WIDTH = 120;
      const NODE_HEIGHT = 60;

      x = Math.max(0, Math.min(x, rect.width - NODE_WIDTH));
      y = Math.max(0, Math.min(y, rect.height - NODE_HEIGHT));

      updatePosition(node.id, x, y);
    };

    const handleMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset, node.id, updatePosition]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setDragging(true);
  };

  return (
    <div
      className="node"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
      }}
    >
    {hovered && (
    <div
        onClick={(e) => {
        e.stopPropagation();
        removeNode(node.id);
        }}
        style={{
        position: "absolute",
        top: -8,
        right: -8,
        width: 18,
        height: 18,
        background: "#ff4d4f",
        color: "white",
        fontSize: 12,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 10,
        }}
    >×</div>
    )}
    {node.type === "operation" && (
        <>
          <div
            onMouseUp={() => finishConnection(node.id, 0)}
            style={{
              position: "absolute",
              left: -6,
              top: "30%",
              width: 10,
              height: 10,
              background: "blue",
              borderRadius: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          />
          <div
            onMouseUp={() => finishConnection(node.id, 1)}
            style={{
              position: "absolute",
              left: -6,
              top: "70%",
              width: 10,
              height: 10,
              background: "blue",
              borderRadius: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          />
        </>
    )}

    {node.type === "function" && (
    <div
        onMouseUp={() => finishConnection(node.id, 0)}
        style={{
        position: "absolute",
        left: -6,
        top: "50%",
        width: 10,
        height: 10,
        background: "blue",
        borderRadius: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
        }}
    />
    )}

    <div
        onMouseDown={handleMouseDown}
        style={{
        width: 140,
        minHeight: 60,
        padding: "10px 12px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        textAlign: "center",
        cursor: "grab",
        userSelect: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",              // ← ДОБАВЬ
        flexDirection: "column",
        justifyContent: "center",     // ← ВАЖНО
        }}
    >

    {node.type === "variable" && (
        <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontWeight: 500,
            fontSize: 16,
        }}
        >
            {node.name}
        </div>
    )}

        {node.type === "operation" && (
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>
            {node.name}
            </div>

            <select
                value={node.operation}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) =>
                    updateNodeOperation?.(
                        node.id,
                        e.target.value as OperationType
                    )
                }
                style={{
                    marginTop: 6,
                    width: "100%",
                    padding: "4px 6px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: 13,
                    outline: "none",
                }}
            >
                <option value="+">+</option>
                <option value="-">-</option>
                <option value="*">*</option>
                <option value="/">/</option>
            </select>
          </div>
        )}
        {node.type === "function" && (
        <div style={{ width: "100%" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>
            {node.name}
            </div>

            <select
            value={node.func}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) =>
                updateNodeFunction?.(
                node.id,
                e.target.value as FunctionType
                )
            }
            style={{
                width: "100%",
                padding: "4px 6px",
                borderRadius: 6,
            }}
            >
            <option value="sin">sin</option>
            <option value="cos">cos</option>
            <option value="tan">tan</option>
            <option value="log">log</option>
            <option value="exp">exp</option>
            <option value="sqrt">sqrt</option>
            <option value="abs">abs</option>
            </select>
        </div>
        )}
    </div>

    <div
        onMouseDown={(e) => {
          e.stopPropagation();
          startConnection(node.id);
        }}
        style={{
          position: "absolute",
          right: -6,
          top: "50%",
          width: 10,
          height: 10,
          background: isConnectingFromThis ? "orange" : "green",
          borderRadius: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
          boxShadow: isConnectingFromThis ? "0 0 6px orange" : "none",
        }}
        />
    </div>
  );
}
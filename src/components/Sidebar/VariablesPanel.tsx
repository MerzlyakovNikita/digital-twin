import type { Node } from "../../types/node";

interface Props {
  nodes: Node[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

export default function VariablesPanel({
  nodes,
  values,
  onChange,
}: Props) {
  const variables = nodes.filter((n) => n.type === "variable");

  return (
    <div className="sidebar left">
      <h3>Переменные</h3>

      {variables.map((v) => (
        <div key={v.id} className="var-item">
          <span>{v.name}</span>

          <input
            type="number"
            value={values[v.id] ?? 0}
            onChange={(e) =>
              onChange(v.id, Number(e.target.value))
            }
          />
        </div>
      ))}
    </div>
  );
}
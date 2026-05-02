import { useState, useEffect } from "react";
import type { Node } from "../../types/node";

interface Props {
  nodes: Node[];
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

export default function VariablesPanel({ nodes, values, onChange }: Props) {
  const variables = nodes.filter((n) => n.type === "variable");

  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalValues((prev) => {
      const updated = { ...prev };

      let changed = false;

      variables.forEach((v) => {
        const newVal = values[v.id]?.toString() ?? "";

        if (updated[v.id] !== newVal) {
          updated[v.id] = newVal;
          changed = true;
        }
      });

      return changed ? updated : prev;
    });
  }, [values]);

  const handleChange = (id: string, val: string) => {
    if (!/^-?[\d.,]*$/.test(val)) return;

    setLocalValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleBlur = (id: string) => {
    const val = localValues[id] ?? "";

    const normalized = val.replace(",", ".");
    const parsed = Number(normalized);

    onChange(id, isNaN(parsed) ? 0 : parsed);
  };

  const changeValue = (id: string, delta: number) => {
    const current = Number(localValues[id] || 0);
    const next = current + delta;

    setLocalValues((prev) => ({
      ...prev,
      [id]: String(next),
    }));

    onChange(id, next);
  };

  return (
    <div className="sidebar left">
      <h3>Переменные</h3>

      {variables.map((v) => (
        <div key={v.id} className="var-item">
          <span title={v.name}>{v.name}</span>

          <div className="number-input">
            <input
              type="text"
              value={localValues[v.id] ?? ""}
              placeholder="0"
              onChange={(e) => handleChange(v.id, e.target.value)}
              onBlur={() => handleBlur(v.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBlur(v.id);
                  e.currentTarget.blur();
                }
              }}
            />

            <div className="controls">
              <button onClick={() => changeValue(v.id, 1)}>▲</button>
              <button onClick={() => changeValue(v.id, -1)}>▼</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useState } from "react";

interface Props {
  onAddVariable: (name: string) => void;
  onAddOperation: (name: string) => void;
  onAddFunction: (name: string) => void;
}

export default function Toolbar({
  onAddVariable,
  onAddOperation,
  onAddFunction,
}: Props) {
  const [varName, setVarName] = useState("");
  const [opName, setOpName] = useState("");
  const [funcName, setFuncName] = useState("");

  return (
    <div className="toolbar">
      <input
        value={varName}
        onChange={(e) => setVarName(e.target.value)}
        placeholder="Имя переменной"
      />
      <button
        onClick={() => {
          const trimmed = varName.trim();
          if (!trimmed) return;
          onAddVariable(trimmed);
          setVarName("");
        }}
      >
        Добавить переменную
      </button>

      <input
        value={opName}
        onChange={(e) => setOpName(e.target.value)}
        placeholder="Имя бинарной операции"
      />
      <button
        onClick={() => {
          const trimmed = opName.trim();
          if (!trimmed) return;
          onAddOperation(trimmed);
          setOpName("");
        }}
      >
        Добавить бинарную операцию
      </button>

      <input
        value={funcName}
        onChange={(e) => setFuncName(e.target.value)}
        placeholder="Имя функции"
      />

      <button
        onClick={() => {
          const trimmed = funcName.trim();
          if (!trimmed) return;
          onAddFunction(trimmed);
          setFuncName("");
        }}
      >
        Добавить функцию
      </button>
    </div>
  );
}

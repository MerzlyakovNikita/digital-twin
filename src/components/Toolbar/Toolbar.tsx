import { useState } from "react";

interface Props {
  onAddVariable: (name: string) => void;
  onAddOperation: (name: string) => void;
  onAddFunction: (name: string) => void;
}

export default function Toolbar({
  onAddVariable,
  onAddOperation,
  onAddFunction
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
          if (!varName) return;
          onAddVariable(varName);
          setVarName("");
        }}
      >
        Добавить переменную
      </button>

      <input
        value={opName}
        onChange={(e) => setOpName(e.target.value)}
        placeholder="Имя операции"
        style={{ marginLeft: 10 }}
      />
      <button
        onClick={() => {
          if (!opName) return;
          onAddOperation(opName);
          setOpName("");
        }}
      >
        Добавить операцию
      </button>

      <input
        value={funcName}
        onChange={(e) => setFuncName(e.target.value)}
        placeholder="Имя функции"
      />

      <button
        onClick={() => {
          if (!funcName) return;
          onAddFunction(funcName);
          setFuncName("");
        }}
      >
        Добавить функцию
      </button>
    </div>
  );
}
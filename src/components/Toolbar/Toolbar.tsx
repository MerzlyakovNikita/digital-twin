import { useState } from "react";

interface Props {
  onAddVariable: (name: string) => void;
  onAddOperation: (name: string) => void;
  onAddFunction: (name: string) => void;
  loadTemplate: () => void;
  saveGraph: () => void;
  loadSavedGraph: () => void;
}

export default function Toolbar({
  onAddVariable,
  onAddOperation,
  onAddFunction,
  loadTemplate,
  saveGraph,
  loadSavedGraph,
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
        Добавить
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
        Добавить
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
        Добавить
      </button>

      <button onClick={loadTemplate}>Демо</button>
      <button onClick={saveGraph}>💾 Сохранить</button>
      <button onClick={loadSavedGraph}>📁 Загрузить</button>
    </div>
  );
}

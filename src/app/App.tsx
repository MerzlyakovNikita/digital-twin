import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import VariablesPanel from "../components/Sidebar/VariablesPanel";
import ResultPanel from "../components/Sidebar/ResultPanel";
import { useGraph } from "../hooks/useGraph";

export default function App() {
  const {
    nodes,
    edges,
    addVariable,
    addOperation,
    addFunction,
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
    variableValues,
    setVariableValue,
  } = useGraph();

  return (
    <div className="app">
      <VariablesPanel
        nodes={nodes}
        values={variableValues}
        onChange={setVariableValue}
      />

      <div className="workspace">
        <Toolbar
          onAddVariable={addVariable}
          onAddOperation={addOperation}
          onAddFunction={addFunction}
        />

        <Canvas
          nodes={nodes}
          edges={edges}
          updatePosition={updatePosition}
          startConnection={startConnection}
          finishConnection={finishConnection}
          removeEdge={removeEdge}
          connecting={connecting}
          mousePos={mousePos}
          updateMousePosition={updateMousePosition}
          cancelConnection={cancelConnection}
          updateNodeOperation={updateNodeOperation}
          removeNode={removeNode}
          updateNodeFunction={updateNodeFunction}
        />
      </div>

      <ResultPanel
        nodes={nodes}
        edges={edges}
        values={variableValues}
      />
    </div>
  );
}
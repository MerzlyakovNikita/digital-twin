import { trainNodes } from '../model/trainModel';
import { InputNode } from '../components/InputNode';
import { GraphView } from '../components/GraphView';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MermaidDiagram } from '../components/MermaidDiagram';
import { buildMermaid } from '../engine/buildMermaid';

export default function App() {
  const recalc = useStore((s) => s.recalc);
  const chart = buildMermaid();
  
  useEffect(() => {
    recalc();
  }, []);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 17,
          marginTop: 17,
          width: 230,
        }}
      >
        {trainNodes
          .filter((n) => n.type === 'input')
          .map((n) => (
            <InputNode key={n.id} id={n.id} label={n.label} />
          ))}
      </div>
      <div style={{ width: '100%'}}>
        <MermaidDiagram chart={chart} />
      </div>
      <GraphView />
    </div>
  );
}
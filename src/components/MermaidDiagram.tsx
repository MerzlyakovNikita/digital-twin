import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    fontSize: '24px',
  },
  flowchart: {
    nodeSpacing: 50,
    rankSpacing: 80,
    curve: 'basis',
  },
});

type Props = {
  chart: string;
};

export const MermaidDiagram = ({ chart }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const id = 'mermaid-' + Math.random().toString(36).slice(2);

    mermaid.render(id, chart).then(({ svg }) => {
      if (ref.current) {
        ref.current.innerHTML = svg;
      }
    });
  }, [chart]);

  return <div ref={ref} />;
};
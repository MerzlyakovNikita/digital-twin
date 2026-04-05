import { trainNodes } from '../model/trainModel';
import { FormulaNode } from './FormulaNode';

export const GraphView = () => {
  return (
    <div>
      {trainNodes
        .filter((n) => n.type === 'compute')
        .map((node) => (
          <FormulaNode key={node.id} node={node} />
        ))}
    </div>
  );
};
import { BlockMath } from 'react-katex';
import { useStore } from '../store/useStore';
import { toLatex, substituteDeep, formatNumber } from '../engine/ast';
import { getUnit } from '../config/units';

export const FormulaNode = ({ node }: any) => {
  const values = useStore((s) => s.values);
  const unit = getUnit(node.id);
  
  if (node.type !== 'compute') return null;

  const base = `${node.lhs} = ${toLatex(node.expr)}`;

  const substitutedExpr = substituteDeep(node.expr, values);
  const substitutedLatex = toLatex(substitutedExpr);

  const result = values[node.id] ?? 0;
  const value = formatNumber(result);

  return (
    <div style={styles.card}>
      <div style={styles.title}>{node.label}</div>

      <div style={styles.formula}>
        <BlockMath math={base} />
      </div>

      <div style={styles.result}>
        <BlockMath
          math={`${node.lhs} = ${substitutedLatex} = ${value}\\;${unit}`}
        />
      </div>
    </div>
  );
};

const styles = {
  card: {
    width: 580,
    minHeight: 140,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    background: '#ffffff',
  },

  title: {
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 16,
    color: '#374151',
  },

  formula: {
    background: '#f9fafb',
    padding: 4,
  },

  result: {
    background: '#eef2ff',
    padding: 4,
  },
};
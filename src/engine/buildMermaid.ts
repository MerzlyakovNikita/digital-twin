import { trainNodes } from '../model/trainModel';
import { extractDeps } from './extractDeps';
import { getUnit } from '../config/units';

const wrap = (text: string) =>
  `<div style="white-space:nowrap">${text}</div>`;

const withUnit = (text: string, id: string) => {
  const unit = getUnit(id);
  return unit ? `${text} [${unit}]` : text;
};

const expand = (name: string) => {
  const node = trainNodes.find(n => n.id === name);
  if (node && node.type === 'compute') {
    return `(${toPretty(node.expr)})`;
  }
  return name;
};

const toPretty = (expr: any): string => {
  switch (expr.type) {
    case 'num':
      return String(expr.value);

    case 'var':
      if (expr.name === 'alpha') return 'α';
      if (expr.name === 'c_r') return 'cᵣ';
      if (['F_d','F_r','F_s'].includes(expr.name)) {
        return expand(expr.name);
      }
      return expr.name;

    case 'mul':
      return `${toPretty(expr.left)} · ${toPretty(expr.right)}`;

    case 'add':
      return `${toPretty(expr.left)} + ${toPretty(expr.right)}`;

    case 'sub':
      return `${toPretty(expr.left)} - ${toPretty(expr.right)}`;

    case 'div':
      return `${toPretty(expr.left)} ÷ ${toPretty(expr.right)}`;

    case 'pow':
      return `${toPretty(expr.base)}²`;

    case 'func':
      return `sin(${toPretty(expr.arg)})`;

    default:
      return '';
  }
};

export const buildMermaid = () => {
  let res = 'flowchart LR\n\n';
  const name = (n: any) => n.display ?? n.lhs;

  // ===== ВХОДЫ =====
  res += 'subgraph inputs [Входные параметры]\n';
  trainNodes.forEach((n) => {
    if (n.type === 'input') {
      const label = toPretty({ type: 'var', name: n.id });
      res += `${n.id}["${wrap(withUnit(label, n.id))}"]\n`;
    }
  });
  res += 'end\n\n';

  // ===== СИЛЫ =====
  trainNodes.forEach((n) => {
    if (n.type === 'compute' && ['F_d', 'F_r', 'F_s'].includes(n.id)) {
      const formula = `${name(n)} = ${toPretty(n.expr)}`;
      res += `${n.id}["${wrap(withUnit(formula, n.id))}"]\n`;
    }
  });

  // ===== F =====
  const Fnode = trainNodes.find((n) => n.id === 'F');
  if (Fnode && Fnode.type === 'compute') {
    res += `F["${wrap(withUnit(`${Fnode.lhs} = ${toPretty(Fnode.expr)}`, 'F'))}"]\n\n`;
  }

  // ===== a =====
  const anode = trainNodes.find((n) => n.id === 'a');
  if (anode && anode.type === 'compute') {
    res += `a["${wrap(withUnit(`a = ${toPretty(anode.expr)}`, 'a'))}"]\n\n`;
  }

  // ===== СВЯЗИ =====
  trainNodes.forEach((n) => {
    if (n.type === 'compute') {
      const deps = extractDeps(n.expr);

      deps.forEach((dep) => {
        res += `${dep} --> ${n.id}\n`;
      });
    }
  });

  res += `
  classDef input fill:#ecfeff,stroke:#06b6d4,padding:4px;
  classDef force fill:#f5f3ff,stroke:#8b5cf6,padding:4px;
  classDef result fill:#fff7ed,stroke:#f97316,padding:4px;
  classDef final fill:#ecfdf5,stroke:#10b981,padding:4px;

  class c,v,m,T,alpha,c_r,g input;
  class F_d,F_r,F_s force;
  class F result;
  class a final;
  `;

  return res;
};
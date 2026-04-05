import type { Expr } from '../types/ast';
import { trainNodes } from '../model/trainModel';

const nodeMap = Object.fromEntries(
  trainNodes.map((n) => [n.id, n])
);

export const formatNumber = (n: number) => {
  return parseFloat(n.toFixed(4)).toString();
};

const wrapIfNegative = (expr: Expr, latex: string) => {
  if (expr.type === 'num' && expr.value < 0) {
    return `(${latex})`;
  }
  return latex;
};

export const toLatex = (e: Expr): string => {
  switch (e.type) {
    case 'num': return formatNumber(e.value);;
    case 'var':
      if (e.name === 'alpha') return '\\alpha';
      return e.name;

    case 'add': {
      const left = toLatex(e.left);
      const right = wrapIfNegative(e.right, toLatex(e.right));
      return `${left} + ${right}`;
    }

    case 'sub': {
      const left = toLatex(e.left);
      const right = wrapIfNegative(e.right, toLatex(e.right));
      return `${left} - ${right}`;
    }

    case 'mul': {
      const left = wrapIfNegative(e.left, toLatex(e.left));
      const right = wrapIfNegative(e.right, toLatex(e.right));
      return `${left} \\cdot ${right}`;
    }
    case 'div': return `\\frac{${toLatex(e.left)}}{${toLatex(e.right)}}`;
    case 'pow': return `${toLatex(e.base)}^{${toLatex(e.exp)}}`;
    case 'func': return `\\sin(${toLatex(e.arg)})`;
  }
};

export const substituteDeep = (
  expr: Expr,
  values: Record<string, number>
): Expr => {
  if (expr.type === 'var') {
    if (values[expr.name] !== undefined) {
      return { type: 'num', value: values[expr.name] };
    }

    const node = nodeMap[expr.name];
    if (node && node.type === 'compute') {
      return substituteDeep(node.expr, values);
    }

    return expr;
  }

  if (expr.type === 'num') return expr;

  if ('left' in expr && 'right' in expr) {
    return {
      ...expr,
      left: substituteDeep(expr.left, values),
      right: substituteDeep(expr.right, values),
    };
  }

  if (expr.type === 'pow') {
    return {
      ...expr,
      base: substituteDeep(expr.base, values),
      exp: substituteDeep(expr.exp, values),
    };
  }

  if (expr.type === 'func') {
    return {
      ...expr,
      arg: substituteDeep(expr.arg, values),
    };
  }

  return expr;
};

export const evaluate = (e: Expr): number => {
  switch (e.type) {
    case 'num':
      return e.value;

    case 'var':
      throw new Error(`Variable ${e.name} not substituted`);

    case 'add':
      return evaluate(e.left) + evaluate(e.right);

    case 'sub':
      return evaluate(e.left) - evaluate(e.right);

    case 'mul':
      return evaluate(e.left) * evaluate(e.right);

    case 'div':
      return evaluate(e.left) / evaluate(e.right);

    case 'pow':
      return Math.pow(evaluate(e.base), evaluate(e.exp));

    case 'func':
      return Math.sin(evaluate(e.arg));

    default: {
      const _exhaustive: never = e;
      return _exhaustive;
    }
  }
};
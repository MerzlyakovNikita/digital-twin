import type { Expr } from '../types/ast';

export const extractDeps = (expr: Expr): string[] => {
  const deps = new Set<string>();

  const walk = (e: Expr) => {
    switch (e.type) {
      case 'var':
        deps.add(e.name);
        return;

      case 'num':
        return;

      case 'add':
      case 'sub':
      case 'mul':
      case 'div':
        walk(e.left);
        walk(e.right);
        return;

      case 'pow':
        walk(e.base);
        walk(e.exp);
        return;

      case 'func':
        walk(e.arg);
        return;

      default: {
        const _exhaustive: never = e;
        return _exhaustive;
      }
    }
  };

  walk(expr);

  return Array.from(deps);
};
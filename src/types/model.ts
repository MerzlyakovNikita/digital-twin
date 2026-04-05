import type { Expr } from './ast';

export type InputNode = {
  id: string;
  type: 'input';
  label: string;
};

export type ComputeNode = {
  id: string;
  type: 'compute';
  label: string;
  lhs: string;
  display: string;
  expr: Expr;
};

export type Node = InputNode | ComputeNode;
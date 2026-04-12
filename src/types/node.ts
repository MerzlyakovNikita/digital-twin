export type NodeType = "variable" | "operation" | "function";

export interface BaseNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
}

export interface VariableNode extends BaseNode {
  type: "variable";
  name: string;
}

export type OperationType = "+" | "-" | "*" | "/";

export interface OperationNode extends BaseNode {
  type: "operation";
  name: string;
  operation: OperationType;
}

export type FunctionType =
  | "sin"
  | "cos"
  | "tan"
  | "log"
  | "exp"
  | "sqrt"
  | "abs";

export interface FunctionNode extends BaseNode {
  type: "function";
  name: string;
  func: FunctionType;
}

export type Node = VariableNode | OperationNode | FunctionNode;
export type Expr =
  | { type: 'num'; value: number }
  | { type: 'var'; name: string }
  | { type: 'add'; left: Expr; right: Expr }
  | { type: 'sub'; left: Expr; right: Expr }
  | { type: 'mul'; left: Expr; right: Expr }
  | { type: 'div'; left: Expr; right: Expr }
  | { type: 'pow'; base: Expr; exp: Expr }
  | { type: 'func'; name: 'sin'; arg: Expr };
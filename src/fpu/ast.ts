// The nodes of a desugared script, which is what the machine interprets.
// The parser also produces `=`, `+=`, ... and `:` nodes; Script rewrites
// those into the ones below.

export interface Resolve {
  op: "$resolve";
  sym: string;
}

// Calls a formula or a builtin, or indexes a variable.
export interface Call {
  op: "$call";
  sym: string;
  args: Node[];
}

export interface Register {
  op: "$register";
  lhs: Resolve;
  rhs: Node;
}

// Assigns one element of a variable: `x(i) = ...`.
export interface SetElement {
  op: "$set";
  lhs: Call;
  rhs: Node;
}

export interface MkScalar {
  op: "$mkscalar";
  value: number;
}

// `args` holds the elements of all `rows` rows, in row-major order.
export interface MkMatrix {
  op: "$mkmatrix";
  rows: number;
  args: Node[];
}

export interface MkFormula {
  op: "$mkformula";
  params: Resolve[];
  formula: Node;
}

export type BinaryOp =
  | "||"
  | "|"
  | "&&"
  | "&"
  | ".||"
  | ".|"
  | ".&&"
  | ".&"
  | "<="
  | "<"
  | ">="
  | ">"
  | "=="
  | "!="
  | "+"
  | "-"
  | "!"
  | "*"
  | "/"
  | ".*"
  | "./"
  | "^"
  | ".^";

// A unary operator is a binary one with a zero on the left: `-x` is `0 - x`.
export interface Binary {
  op: BinaryOp;
  lhs: Node;
  rhs: Node;
}

export type Node =
  | Resolve
  | Call
  | Register
  | SetElement
  | MkScalar
  | MkMatrix
  | MkFormula
  | Binary;

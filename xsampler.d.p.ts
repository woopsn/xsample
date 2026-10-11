// Types for the parser that the plugin in vite.config.js compiles from
// xsampler.p.

import type { BinaryOp, MkScalar, Resolve } from "./src/fpu/ast";

export interface ParsedCall {
  op: "$call";
  sym: string;
  args: Parsed[];
}

export interface ParsedMatrix {
  op: "$mkmatrix";
  rows: number;
  args: Parsed[];
}

export interface ParsedFormula {
  op: "$mkformula";
  params: Parsed[];
  formula: Parsed;
}

// `:` builds a range: `a:b`.
export interface ParsedBinary {
  op: BinaryOp | ":";
  lhs: Parsed;
  rhs: Parsed;
}

export type CompoundOp =
  "+=" | "-=" | "*=" | "/=" | "^=" | "|=" | "&=" | ".*=" | "./=" | ".^=";

export interface ParsedAssignment {
  op: "=" | CompoundOp;
  lhs: Resolve | ParsedCall;
  rhs: Parsed;
}

export type Parsed =
  | Resolve
  | MkScalar
  | ParsedCall
  | ParsedMatrix
  | ParsedFormula
  | ParsedBinary
  | ParsedAssignment;

// Throws a SyntaxError if the source is not a script.
export function parse(source: string): Parsed[];

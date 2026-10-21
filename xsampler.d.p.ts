// Types for the parser that the plugin in vite.config.js compiles from
// xsampler.p.

import type { BinaryOp, MkScalar, MkString, Resolve } from "./src/fpu/ast";

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

export interface ParsedBinary {
  op: BinaryOp;
  lhs: Parsed;
  rhs: Parsed;
}

// `start:end`, or `start:step:end`.
export interface ParsedRange {
  op: ":";
  start: Parsed;
  step?: Parsed;
  end: Parsed;
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
  | MkString
  | ParsedCall
  | ParsedMatrix
  | ParsedFormula
  | ParsedBinary
  | ParsedRange
  | ParsedAssignment;

// Throws a SyntaxError if the source is not a script.
export function parse(source: string): Parsed[];

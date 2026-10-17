import type { Node, Resolve } from "./ast";

// The parameters and body of `@(x) ...`.
export interface Formula {
  params: Resolve[];
  body: Node;
}

// Every value is a matrix in row-major order; a scalar is 1x1, and a string
// is a row of character codes.
export interface Value {
  rows: number;
  cols: number;
  data: Float64Array;
  formula?: Formula;
}

export function mknum(rows: number, cols: number, val?: number): Value {
  const num: Value = { rows, cols, data: new Float64Array(rows * cols) };
  if (val) num.data.fill(val);
  return num;
}

export function mkstring(text: string): Value {
  const codes = Float64Array.from(text, (c) => c.codePointAt(0)!);
  return { rows: 1, cols: codes.length, data: codes };
}

// The text of a string value.
export function stringOf(value: Value): string {
  return String.fromCodePoint(...value.data);
}

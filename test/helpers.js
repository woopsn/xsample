import { Script } from "../src/xsampler/script";
import { vm } from "../src/fpu/vm";
import { library, constants } from "../src/fpu/library";

// Parses and desugars a script, returning its AST.
export function compile(source) {
  return new Script({ value: source }).compile();
}

// Runs a script on a fresh machine and returns its global variables by name.
export function run(source) {
  const machine = new vm(library, constants);
  machine.exec(compile(source));
  return machine.frames[0];
}

// The value a script produces for the given rows:
// matrix([1, 2], [3, 4]) is what `[1, 2; 3, 4]` evaluates to.
export function matrix(...rows) {
  return {
    rows: rows.length,
    cols: rows[0].length,
    data: Float64Array.from(rows.flat()),
  };
}

export function scalar(value) {
  return matrix([value]);
}

// AST nodes for a numeric literal and a variable reference.
export function literal(value) {
  return { op: "$mkscalar", value };
}

export function variable(sym) {
  return { op: "$resolve", sym };
}

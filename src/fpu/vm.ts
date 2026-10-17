import type { BinaryOp, Node, Resolve } from "./ast";
import type { Event, ParamId } from "./events";
import { mknum, mkstring } from "./value";
import type { Formula, Value } from "./value";

// The variables of one scope, by name.
export type Frame = Record<string, Value>;

export type Builtin = (vm: Machine, args: Value[]) => Value;

export class Machine {
  library: Record<string, Builtin>;
  constants: Frame;

  // Receives each event as the script emits it.
  emit: (event: Event) => void;

  // The values the host has set for the script's parameters.
  params = new Map<ParamId, number>();

  // The figure that `plot`, `scatter`, `xlim` and `ylim` draw on, which
  // `figure` changes.
  figure = 1;

  // The global frame, then one for each formula being evaluated.
  frames: Frame[] = [{}];

  constructor(
    library: Record<string, Builtin>,
    constants: Frame,
    emit: (event: Event) => void,
  ) {
    this.library = library;
    this.constants = constants;
    this.emit = emit;
  }

  exec(ast: Node[]): void {
    Object.assign(this.frames[0], this.constants);

    for (const node of ast) this.interpret(node);
  }

  interpret(node: Node): Value {
    switch (node.op) {
      case "$register": {
        const rhs = this.interpret(node.rhs);
        const sym = node.lhs.sym;

        const frame = this.frameOf(sym) ?? this.frames[this.frames.length - 1];
        frame[sym] = rhs;

        return rhs;
      }

      case "$resolve": {
        const value = this.frameOf(node.sym)?.[node.sym];

        if (value == null) throw "unknown symbol: " + node.sym;

        return value;
      }

      case "$set": {
        const rhs = this.interpret(node.rhs);
        const sym = node.lhs.sym;

        const lhs = this.frameOf(sym)?.[sym];

        if (lhs == null) throw "unknown symbol: " + sym;

        const args = node.lhs.args.map((a) => this.interpret(a));

        if (args.length == 1) lhs.data[args[0].data[0]] = rhs.data[0];
        else if (args.length == 2)
          lhs.data[lhs.cols * args[0].data[0] + args[1].data[0]] = rhs.data[0];

        return rhs;
      }

      case "$call": {
        const args = node.args.map((a) => this.interpret(a));

        // a variable shadows a builtin of the same name
        const variable = this.frameOf(node.sym)?.[node.sym];

        if (variable?.formula) return this.evaluate(variable.formula, args);
        if (variable) return index(variable, args);

        const builtin = this.library[node.sym];

        if (builtin) return builtin(this, args);

        throw "symbol is undefined: " + node.sym;
      }

      case "$mkscalar": {
        const value = mknum(1, 1);
        value.data[0] = node.value;

        return value;
      }

      case "$mkstring":
        return mkstring(node.value);

      case "$mkmatrix": {
        const args = node.args.map((a) => this.interpret(a));

        const rows = node.rows;
        const cols = args.length / rows;

        const value = mknum(rows, cols);

        for (let i = 0; i < rows; ++i) {
          for (let j = 0; j < cols; ++j) {
            value.data[i * cols + j] = args[i * cols + j].data[0];
          }
        }

        return value;
      }

      case "$mkformula":
        return mkformula(node.params, node.formula);

      default: {
        const lhs = this.interpret(node.lhs);
        const rhs = this.interpret(node.rhs);

        return binary(node.op, lhs, rhs);
      }
    }
  }

  evaluate(formula: Formula, args: Value[]): Value {
    this.frames.push(bind(formula.params, args));
    const value = this.interpret(formula.body);
    this.frames.pop();
    return value;
  }

  // The innermost frame that defines a symbol.
  private frameOf(sym: string): Frame | undefined {
    for (let i = this.frames.length - 1; i >= 0; --i) {
      if (this.frames[i][sym]) return this.frames[i];
    }

    return undefined;
  }
}

function binary(operator: BinaryOp, lhs: Value, rhs: Value): Value {
  let op: string = operator;
  let rows = lhs.rows;
  let cols = lhs.cols;

  if (lhs.data.length == 1 && rhs.data.length != 1) {
    // scalar op on matrix
    op = "s" + op;
    rows = rhs.rows;
    cols = rhs.cols;
  } else if (lhs.data.length != 1 && rhs.data.length == 1) {
    // matrix op on scalar
    op = op + "s";
  } else if (op == "*" && lhs.data.length != 1 && rhs.cols == 1) {
    // matrix times vector
    op = "*v";
  }

  const value = mknum(rows, cols);

  switch (op) {
    case "+":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] + rhs.data[i];
      break;
    case "s+":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = lhs.data[0] + rhs.data[i];
      break;
    case "+s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] + rhs.data[0];
      break;

    case "-":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] - rhs.data[i];
      break;
    case "s-":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = lhs.data[0] - rhs.data[i];
      break;
    case "-s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] - rhs.data[0];
      break;

    case ".*":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] * rhs.data[i];
      break;
    case "s*":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = lhs.data[0] * rhs.data[i];
      break;
    case "*s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] * rhs.data[0];
      break;

    case "./":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] / rhs.data[i];
      break;
    case "/":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] / rhs.data[i];
      break;
    case "s/":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = lhs.data[0] / rhs.data[i];
      break;
    case "/s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = lhs.data[i] / rhs.data[0];
      break;

    case "*": {
      // assert dimensions match
      const product = mknum(lhs.rows, rhs.cols);

      for (let i = 0; i < lhs.rows; i++) {
        const irow1 = i * rhs.cols;
        const irow2 = i * rhs.rows;
        for (let j = 0; j < rhs.cols; ++j) {
          for (let k = 0; k < rhs.rows; ++k)
            product.data[irow1 + j] +=
              lhs.data[irow2 + k] * rhs.data[k * rhs.cols + j];
        }
      }

      return product;
    }

    case "*v": {
      // assert dimensions match
      const product = mknum(lhs.rows, 1);

      for (let i = 0; i < lhs.rows; i++) {
        const irow = i * lhs.cols;
        for (let j = 0; j < lhs.cols; ++j)
          product.data[i] += lhs.data[irow + j] * rhs.data[j];
      }

      return product;
    }

    case ".^":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Math.pow(lhs.data[i], rhs.data[i]);
      break;
    case "s.^":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Math.pow(lhs.data[0], rhs.data[i]);
      break;
    case ".^s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Math.pow(lhs.data[i], rhs.data[0]);
      break;
    case "^":
      // assert(lhs.data.length == 1, rhs.data.length == 1)
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Math.pow(lhs.data[i], rhs.data[i]);
      break;

    case "==":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] == rhs.data[i]);
      break;
    case "s==":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] == rhs.data[i]);
      break;
    case "==s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] == rhs.data[0]);
      break;

    case "!=":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] != rhs.data[i]);
      break;
    case "s!=":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] != rhs.data[i]);
      break;
    case "!=s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] != rhs.data[0]);
      break;

    case "<":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] < rhs.data[i]);
      break;
    case "s<":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] < rhs.data[i]);
      break;
    case "<s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] < rhs.data[0]);
      break;

    case "<=":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] <= rhs.data[i]);
      break;
    case "s<=":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] <= rhs.data[i]);
      break;
    case "<=s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] <= rhs.data[0]);
      break;

    case ">":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] > rhs.data[i]);
      break;
    case "s>":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] > rhs.data[i]);
      break;
    case ">s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] > rhs.data[0]);
      break;

    case ">=":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] >= rhs.data[i]);
      break;
    case "s>=":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] >= rhs.data[i]);
      break;
    case ">=s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] >= rhs.data[0]);
      break;

    case "|":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] != 0 || rhs.data[i] != 0);
      break;
    case "s|":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] != 0 || rhs.data[i] != 0);
      break;
    case "|s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] != 0 || rhs.data[0] != 0);
      break;

    case "&":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] != 0 && rhs.data[i] != 0);
      break;
    case "s&":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(lhs.data[0] != 0 && rhs.data[i] != 0);
      break;
    case "&s":
      for (let i = 0; i < lhs.data.length; i++)
        value.data[i] = Number(lhs.data[i] != 0 && rhs.data[0] != 0);
      break;

    // `!x` is `0 ! x`, so the zero on the left is ignored
    case "!":
    case "s!":
      for (let i = 0; i < rhs.data.length; i++)
        value.data[i] = Number(!rhs.data[i]);
      break;

    default:
      throw "unknown operator: " + op;
  }

  return value;
}

function mkformula(params: Resolve[], body: Node): Value {
  const num = mknum(1, 1, 1);
  num.formula = { params, body };

  return num;
}

function bind(params: Resolve[], args: Value[]): Frame {
  // assert params.length == args.length
  const frame: Frame = {};

  params.forEach((p, i) => {
    frame[p.sym] = args[i];
  });

  return frame;
}

// `a(k)` selects the elements of a at the indices in k, in the shape of k;
// `a(i, j)` selects those in rows i and columns j.
function index(num: Value, index: Value[]): Value {
  if (index.length == 1) {
    const [k] = index;
    const value = mknum(k.rows, k.cols);

    for (let n = 0; n < k.data.length; ++n) value.data[n] = num.data[k.data[n]];

    return value;
  }

  const [i, j] = index;
  const value = mknum(i.data.length, j.data.length);

  for (let m = 0; m < i.data.length; ++m)
    for (let n = 0; n < j.data.length; ++n)
      value.data[m * value.cols + n] =
        num.data[i.data[m] * num.cols + j.data[n]];

  return value;
}

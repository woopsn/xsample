import { parse } from "../../xsampler.p";
import type { CompoundOp, Parsed, ParsedCall } from "../../xsampler.p";
import type { BinaryOp, Call, Node, Resolve } from "../fpu/ast";

// Where a script's text is read from, such as a textarea.
export interface Source {
  value: string;
}

export class Script {
  source: Source;

  constructor(source: Source) {
    this.source = source;
  }

  // Parses the script and desugars it into what the machine interprets.
  compile(): Node[] {
    return parse(this.source.value.trim()).map(desugar);
  }
}

// The operator that each compound assignment applies: `x += 1` is `x = x + 1`.
const operators: Record<CompoundOp, BinaryOp> = {
  "+=": "+",
  "-=": "-",
  "*=": "*",
  "/=": "/",
  "^=": "^",
  "|=": "|",
  "&=": "&",
  ".*=": ".*",
  "./=": "./",
  ".^=": ".^",
};

function desugar(node: Parsed): Node {
  switch (node.op) {
    case "$resolve":
    case "$mkscalar":
      return node;

    case "$call":
      return call(node);

    case "$mkmatrix":
      return { ...node, args: node.args.map(desugar) };

    case "$mkformula":
      // the grammar accepts any expression as a parameter, not just a name
      return {
        ...node,
        params: node.params as Resolve[],
        formula: desugar(node.formula),
      };

    case "=":
      return assign(node.lhs, desugar(node.rhs));

    case "+=":
    case "-=":
    case "*=":
    case "/=":
    case "^=":
    case "|=":
    case "&=":
    case ".*=":
    case "./=":
    case ".^=": {
      const lhs = desugar(node.lhs);
      const rhs = desugar(node.rhs);

      return assign(node.lhs, binary(operators[node.op], lhs, rhs));
    }

    case ":":
      return {
        op: "$call",
        sym: "colon",
        args: [desugar(node.lhs), desugar(node.rhs)],
      };

    default:
      return binary(node.op, desugar(node.lhs), desugar(node.rhs));
  }
}

function call(node: ParsedCall): Call {
  return { ...node, args: node.args.map(desugar) };
}

// Assigning to a variable registers it; assigning to `x(i)` sets an element.
function assign(target: Resolve | ParsedCall, rhs: Node): Node {
  if (target.op == "$resolve") return { op: "$register", lhs: target, rhs };

  return { op: "$set", lhs: call(target), rhs };
}

// `x^T` is the transpose of x.
function binary(op: BinaryOp, lhs: Node, rhs: Node): Node {
  if (op == "^" && rhs.op == "$resolve" && rhs.sym == "T")
    return { op: "$call", sym: "transpose", args: [lhs] };

  return { op, lhs, rhs };
}

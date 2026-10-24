import { describe, expect, test } from "vitest";
import { Script } from "../src/xsampler/script";
import { ScriptError } from "../src/fpu/vm";
import { literal, variable } from "./helpers";

// The nodes a script desugars into, without the lines they start on.
function compile(source) {
  return new Script({ value: source })
    .compile()
    .map((statement) => statement.node);
}

describe("desugaring", () => {
  test("assigning to a variable registers it", () => {
    expect(compile("x = 1")).toEqual([
      { op: "$register", lhs: variable("x"), rhs: literal(1) },
    ]);
  });

  test("assigning to an indexed variable sets an element", () => {
    expect(compile("x(0) = 1")).toEqual([
      {
        op: "$set",
        lhs: { op: "$call", sym: "x", args: [literal(0)] },
        rhs: literal(1),
      },
    ]);
  });

  test("compound assignment applies its operator first", () => {
    expect(compile("x += 2")).toEqual([
      {
        op: "$register",
        lhs: variable("x"),
        rhs: { op: "+", lhs: variable("x"), rhs: literal(2) },
      },
    ]);
  });

  test("a:b calls colon", () => {
    expect(compile("1:n")).toEqual([
      { op: "$call", sym: "colon", args: [literal(1), variable("n")] },
    ]);
  });

  test("a:s:b calls colon with the step last", () => {
    expect(compile("1:2:n")).toEqual([
      {
        op: "$call",
        sym: "colon",
        args: [literal(1), variable("n"), literal(2)],
      },
    ]);
  });

  test("^T calls transpose", () => {
    expect(compile("x^T")).toEqual([
      { op: "$call", sym: "transpose", args: [variable("x")] },
    ]);
  });

  test("formula bodies are desugared", () => {
    const [{ formula }] = compile("@(n) 0:n");

    expect(formula).toEqual(compile("0:n")[0]);
  });
});

describe("syntax errors", () => {
  test("are thrown as a ScriptError at the line they arise on", () => {
    const script = new Script({ value: "x = 1\n\ny = (2 +" });

    expect(() => script.compile()).toThrow(
      expect.objectContaining({ constructor: ScriptError, line: 3 }),
    );
  });
});

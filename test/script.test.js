import { describe, expect, test } from "vitest";
import { compile, literal, variable } from "./helpers";

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

  test("^T calls transpose", () => {
    expect(compile("x^T")).toEqual([
      { op: "$call", sym: "transpose", args: [variable("x")] },
    ]);
  });
});

describe("known bugs", () => {
  test.fails("formula bodies are desugared", () => {
    const [{ formula }] = compile("@(n) 0:n");

    expect(formula).toEqual(compile("0:n")[0]);
  });
});

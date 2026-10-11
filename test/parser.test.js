import { describe, expect, test } from "vitest";
import { parse } from "../xsampler.p";
import { literal, variable } from "./helpers";

describe("literals", () => {
  test("integer", () => {
    expect(parse("42")).toEqual([literal(42)]);
  });

  test("decimal", () => {
    expect(parse("0.25")).toEqual([literal(0.25)]);
  });

  test("decimal with exponent", () => {
    expect(parse("1.5e-2")).toEqual([literal(0.015)]);
  });

  test("integer with exponent", () => {
    expect(parse("1e5")).toEqual([literal(1e5)]);
    expect(parse("2e-3")).toEqual([literal(0.002)]);
    expect(parse("2e+3")).toEqual([literal(2000)]);
  });

  test("matrix lists its elements row by row", () => {
    expect(parse("[1, 2; 3, 4]")).toEqual([
      { op: "$mkmatrix", rows: 2, args: [1, 2, 3, 4].map(literal) },
    ]);
  });

  test("matrix elements may be separated by spaces", () => {
    expect(parse("[1 2]")).toEqual(parse("[1, 2]"));
  });
});

describe("expressions", () => {
  test("variable", () => {
    expect(parse("x_1")).toEqual([variable("x_1")]);
  });

  test("call", () => {
    expect(parse("f(1, x)")).toEqual([
      { op: "$call", sym: "f", args: [literal(1), variable("x")] },
    ]);
  });

  test("call without arguments", () => {
    expect(parse("f()")).toEqual([{ op: "$call", sym: "f", args: [] }]);
  });

  test("formula", () => {
    expect(parse("@(a, b) a + b")).toEqual([
      {
        op: "$mkformula",
        params: [variable("a"), variable("b")],
        formula: { op: "+", lhs: variable("a"), rhs: variable("b") },
      },
    ]);
  });

  test("unary minus subtracts from zero", () => {
    expect(parse("-x")).toEqual([
      { op: "-", lhs: literal(0), rhs: variable("x") },
    ]);
  });

  test("assignment", () => {
    expect(parse("x = 1")).toEqual([
      { op: "=", lhs: variable("x"), rhs: literal(1) },
    ]);
  });
});

describe("precedence", () => {
  test("multiplication binds tighter than addition", () => {
    expect(parse("1 + 2 * 3")).toEqual(parse("1 + (2 * 3)"));
  });

  test("exponentiation binds tighter than multiplication", () => {
    expect(parse("2 * 3 ^ 4")).toEqual(parse("2 * (3 ^ 4)"));
  });

  test("addition binds tighter than comparison", () => {
    expect(parse("1 + 2 < 3 + 4")).toEqual(parse("(1 + 2) < (3 + 4)"));
  });

  test("comparison binds tighter than range", () => {
    expect(parse("0 : 1 < 2")).toEqual(parse("0 : (1 < 2)"));
  });

  test("binary operators associate to the left", () => {
    expect(parse("1 - 2 - 3")).toEqual(parse("(1 - 2) - 3"));
  });

  test("elementwise operators keep their dot", () => {
    expect(parse("a .* b")).toEqual([
      { op: ".*", lhs: variable("a"), rhs: variable("b") },
    ]);
  });
});

describe("statements", () => {
  test("end at a newline or a semicolon", () => {
    expect(parse("a\nb; c")).toEqual(["a", "b", "c"].map(variable));
  });

  test("blank lines between statements are skipped", () => {
    expect(parse("a\n\n\nb")).toEqual(["a", "b"].map(variable));
  });

  test("an incomplete expression is a syntax error", () => {
    expect(() => parse("x = 1 +")).toThrow(SyntaxError);
  });

  test("there is no comment syntax", () => {
    expect(() => parse("x = 1 # one")).toThrow(SyntaxError);
  });
});

describe("known bugs", () => {
  test.fails("... continues a statement on the next line", () => {
    expect(parse("1 ...\n + 2")).toEqual(parse("1 + 2"));
  });
});

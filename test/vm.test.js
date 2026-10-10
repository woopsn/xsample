import { describe, expect, test } from "vitest";
import { matrix, run, scalar } from "./helpers";

describe("arithmetic", () => {
    test("on scalars", () => {
        expect(run("x = 1 + 2 * 3 - 8 / 4").x).toEqual(scalar(5));
    });

    test("scalar exponentiation", () => {
        expect(run("x = 2 ^ 3").x).toEqual(scalar(8));
    });

    test("is elementwise on matrices of the same shape", () => {
        expect(run("x = [1, 2; 3, 4] + [10, 20; 30, 40]").x)
            .toEqual(matrix([11, 22], [33, 44]));
    });

    test("a scalar on the left applies to every element", () => {
        expect(run("x = 6 / [1, 2, 3]").x).toEqual(matrix([6, 3, 2]));
    });

    test("a scalar on the right applies to every element", () => {
        expect(run("x = [1, 2, 3] - 1").x).toEqual(matrix([0, 1, 2]));
    });

    test("dotted operators are elementwise", () => {
        expect(run("x = [1, 2, 3] .* [4, 5, 6]").x).toEqual(matrix([4, 10, 18]));
        expect(run("x = [1, 2, 3] .^ 2").x).toEqual(matrix([1, 4, 9]));
    });

    test("unary minus negates every element", () => {
        expect(run("x = -[1, 2]").x).toEqual(matrix([-1, -2]));
    });
});

describe("matrix product", () => {
    test("of two matrices", () => {
        expect(run("x = [1, 2; 3, 4] * [5, 6; 7, 8]").x)
            .toEqual(matrix([19, 22], [43, 50]));
    });

    test("of a matrix and a column vector", () => {
        expect(run("x = [1, 2; 3, 4] * [1; 1]").x).toEqual(matrix([3], [7]));
    });

    test("of a row and a column is their inner product", () => {
        expect(run("x = [1, 2, 3] * [1; 1; 1]").x).toEqual(scalar(6));
    });

    test("of a column and a row is their outer product", () => {
        expect(run("x = [1; 2] * [3, 4]").x).toEqual(matrix([3, 4], [6, 8]));
    });
});

describe("comparison", () => {
    test("yields 1 for true and 0 for false", () => {
        expect(run("x = 1 < 2").x).toEqual(scalar(1));
        expect(run("x = 1 == 2").x).toEqual(scalar(0));
    });

    test("is elementwise", () => {
        expect(run("x = [1, 2] == [1, 3]").x).toEqual(matrix([1, 0]));
        expect(run("x = [1, 2, 3] >= 2").x).toEqual(matrix([0, 1, 1]));
        expect(run("x = 2 <= [1, 2, 3]").x).toEqual(matrix([0, 1, 1]));
    });
});

describe("variables", () => {
    test("hold the value last assigned", () => {
        expect(run("x = 1\nx = 2").x).toEqual(scalar(2));
    });

    test("compound assignment updates in place", () => {
        expect(run("x = [1, 2]\nx .*= [3, 4]").x).toEqual(matrix([3, 8]));
    });

    test("Math constants are predefined in lower case", () => {
        expect(run("x = pi").x).toEqual(scalar(Math.PI));
        expect(run("x = ln2").x).toEqual(scalar(Math.LN2));
    });

    test("reading an undefined variable throws", () => {
        expect(() => run("x = nosuch")).toThrow("unknown symbol: nosuch");
    });

    test("calling an undefined function throws", () => {
        expect(() => run("x = nosuch(1)")).toThrow("symbol is undefined: nosuch");
    });
});

describe("indexing", () => {
    test("is 0-based", () => {
        expect(run("a = [4, 5, 6]\nx = a(1)").x).toEqual(scalar(5));
    });

    test("assigns one element of a vector", () => {
        expect(run("x = [1, 2, 3]\nx(1) = 9").x).toEqual(matrix([1, 9, 3]));
    });

    test("assigns one element of a matrix by row and column", () => {
        expect(run("x = [1, 2; 3, 4]\nx(1, 0) = 9").x)
            .toEqual(matrix([1, 2], [9, 4]));
    });
});

describe("formulas", () => {
    test("are called with their arguments bound to parameters", () => {
        expect(run("f = @(a, b) a - b\nx = f(5, 3)").x).toEqual(scalar(2));
    });

    test("see variables of the enclosing script", () => {
        expect(run("k = 10\nf = @(a) k * a\nx = f(2)").x).toEqual(scalar(20));
    });

    test("parameters shadow variables of the same name", () => {
        expect(run("a = 1\nf = @(a) a + 1\nx = f(5)").x).toEqual(scalar(6));
    });
});

describe("known bugs", () => {
    test.fails("whitespace separates a signed matrix element", () => {
        expect(run("x = [1 -1]").x).toEqual(matrix([1, -1]));
    });

    test.fails("exponentiation binds tighter than unary minus", () => {
        expect(run("x = -2 ^ 2").x).toEqual(scalar(-4));
    });

    test.fails("a matrix compares <= against a scalar", () => {
        expect(run("x = [1, 2, 3] <= 2").x).toEqual(matrix([1, 1, 0]));
    });

    test.fails(".^ takes a scalar base", () => {
        expect(run("x = 2 .^ [1, 2, 3]").x).toEqual(matrix([2, 4, 8]));
    });

    test.fails("logical operators evaluate", () => {
        expect(run("x = 1 | 0").x).toEqual(scalar(1));
    });

    test.fails("unary ! negates", () => {
        expect(run("x = !1").x).toEqual(scalar(0));
    });

    test.fails("a vector index selects several elements", () => {
        expect(run("a = [4, 5, 6]\nx = a([0, 1])").x).toEqual(matrix([4, 5]));
    });

    test.fails("two indices select by row and column", () => {
        expect(run("a = [1, 2; 3, 4]\nx = a(1, 0)").x).toEqual(scalar(3));
    });

    test.fails("a formula can use a range", () => {
        expect(run("f = @(n) 0:n\nx = f(2)").x).toEqual(matrix([0, 1, 2]));
    });
});

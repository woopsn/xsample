import { describe, expect, test } from "vitest";
import { matrix, run, scalar } from "./helpers";

describe("constructors", () => {
  test("linspace includes both endpoints", () => {
    expect(run("x = linspace(0, 1, 5)").x).toEqual(
      matrix([0, 0.25, 0.5, 0.75, 1]),
    );
  });

  test("linspace defaults to 100 points", () => {
    expect(run("x = linspace(0, 1)").x.cols).toBe(100);
  });

  test("colon counts up to and including its end", () => {
    expect(run("x = colon(0, 3)").x).toEqual(matrix([0, 1, 2, 3]));
  });

  test("colon takes a step as its third argument", () => {
    expect(run("x = colon(0, 1, 0.25)").x).toEqual(
      matrix([0, 0.25, 0.5, 0.75, 1]),
    );
  });

  test("colon reaches an end that its step misses only by rounding", () => {
    const { x } = run("x = colon(0, 0.3, 0.1)");

    expect(x.cols).toBe(4);
    expect(x.data[3]).toBe(0.3);
  });

  test("colon does not pass an end that its step misses", () => {
    expect(run("x = colon(0, 1, 0.3)").x.cols).toBe(4);
  });

  test("colon is empty if its step points away from its end", () => {
    expect(run("x = colon(3, 0)").x).toEqual(matrix([]));
    expect(run("x = colon(0, 3, -1)").x).toEqual(matrix([]));
  });

  test("colon is empty if its step is zero", () => {
    expect(run("x = colon(0, 3, 0)").x).toEqual(matrix([]));
  });

  test("zeros", () => {
    expect(run("x = zeros(2, 3)").x).toEqual(matrix([0, 0, 0], [0, 0, 0]));
  });

  test("matrix fills each element from its row and column", () => {
    expect(run("x = matrix(2, 2, @(i, j) 10*i + j)").x).toEqual(
      matrix([0, 1], [10, 11]),
    );
  });

  test("matrix fills a non-square result", () => {
    expect(run("x = matrix(2, 3, @(i, j) 10*i + j)").x).toEqual(
      matrix([0, 1, 2], [10, 11, 12]),
    );
  });
});

describe("reductions", () => {
  test("length counts every element", () => {
    expect(run("x = length([1, 2; 3, 4])").x).toEqual(scalar(4));
  });

  test("sum", () => {
    expect(run("x = sum([1, 2, 3])").x).toEqual(scalar(6));
  });

  test("mean", () => {
    expect(run("x = mean([1, 2, 3])").x).toEqual(scalar(2));
  });

  test("norm is the Euclidean length", () => {
    expect(run("x = norm([3, 4])").x).toEqual(scalar(5));
  });

  test("max spans all of its arguments", () => {
    expect(run("x = max(1, [2, 7])").x).toEqual(scalar(7));
  });

  test("min of positive numbers", () => {
    expect(run("x = min([3, 2, 5])").x).toEqual(scalar(2));
  });

  test("max of negative numbers", () => {
    expect(run("x = max([-3, -2])").x).toEqual(scalar(-2));
  });
});

describe("iteration", () => {
  test("iterate applies a formula n times", () => {
    expect(run("x = iterate(@(u) 2*u, 3, 1)").x).toEqual(scalar(8));
  });

  test("iterate passes the step number as a second argument", () => {
    expect(run("x = iterate(@(u, i) u + i, 4, 0)").x).toEqual(scalar(6));
  });

  test("iterate2 collects every step", () => {
    expect(run("x = iterate2(@(u) 2*u, 4, 1)").x).toEqual(
      matrix([2, 4, 8, 16]),
    );
  });

  test("fold accumulates over the elements of a vector", () => {
    expect(run("x = fold(colon(1, 4), 0, @(s, k) s + k)").x).toEqual(
      scalar(10),
    );
  });
});

describe("vector operations", () => {
  test("Math functions apply elementwise", () => {
    expect(run("x = abs([-1, 2])").x).toEqual(matrix([1, 2]));
  });

  test("transpose swaps rows and columns", () => {
    expect(run("x = transpose([1, 2; 3, 4; 5, 6])").x).toEqual(
      matrix([1, 3, 5], [2, 4, 6]),
    );
  });

  test("unit scales to norm 1", () => {
    expect(run("x = unit([3, 4])").x).toEqual(matrix([0.6, 0.8]));
  });

  test("conv is the full convolution", () => {
    expect(run("x = conv([1, 1], [1, 2, 1])").x).toEqual(matrix([1, 3, 3, 1]));
  });

  test("shift moves elements right, filling with zeros", () => {
    expect(run("x = shift([1, 2, 3], 1)").x).toEqual(matrix([0, 1, 2]));
  });

  test("shift by a negative count moves elements left", () => {
    expect(run("x = shift([1, 2, 3], -1)").x).toEqual(matrix([2, 3, 0]));
  });

  test("fftshift swaps the halves of an even-length vector", () => {
    expect(run("x = fftshift([1, 2, 3, 4])").x).toEqual(matrix([3, 4, 1, 2]));
  });

  test("fftshift centres the first element of an odd-length vector", () => {
    expect(run("x = fftshift([1, 2, 3, 4, 5])").x).toEqual(
      matrix([4, 5, 1, 2, 3]),
    );
  });
});

const closeTo = (values) => values.map((v) => expect.closeTo(v));

describe("Fourier transform", () => {
  const h = Math.SQRT1_2;

  test("dft_r is the real part of the unitary DFT matrix", () => {
    expect(Array.from(run("x = dft_r(2)").x.data)).toEqual(
      closeTo([h, h, h, -h]),
    );
  });

  test("dft_i is the imaginary part of the unitary DFT matrix", () => {
    expect(Array.from(run("x = dft_i(4)").x.data).slice(4, 8)).toEqual(
      closeTo([0, -0.5, 0, 0.5]),
    );
  });
});

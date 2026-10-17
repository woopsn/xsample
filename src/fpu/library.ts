import { emitters } from "./events";
import { mknum } from "./value";
import type { Value } from "./value";
import type { Builtin } from "./vm";

function norm(x: Value): number {
  let sum = 0;

  // TODO sumPrecise
  for (let i = 0; i < x.data.length; ++i) sum += Math.pow(x.data[i], 2);

  return Math.sqrt(sum);
}

export const library: Record<string, Builtin> = {
  ...emitters,

  print(fpu, args) {
    args.forEach(function (a, i) {
      console.log("[" + i + "]", a);
    });

    return mknum(0, 0);
  },

  linspace(fpu, args) {
    // assert args[0], args[1] are scalar
    // assert !args[2] || args[2] is scalar
    const min = args[0].data[0],
      max = args[1].data[0];
    const N = Math.floor(args[2] ? args[2].data[0] : 100);

    const result = mknum(1, N),
      data = result.data;

    for (let i = 0; i < N; ++i) data[i] = min + (i * (max - min)) / (N - 1);

    return result;
  },

  colon(fpu, args) {
    // assert args[0], args[1] are scalar
    // assert !args[2] || args[2] is scalar
    const min = args[0].data[0],
      max = args[1].data[0];
    const step = args[2] ? args[2].data[0] : 1;

    const result = mknum(1, Math.floor((max - min) / step) + 1),
      data = result.data,
      n = data.length;

    for (let i = 0; i < n; ++i) data[i] = min + i * step;

    return result;
  },

  zeros(fpu, args) {
    // assert args.length == 2
    // assert args[0], args[1] are scalar
    const m = args[0],
      n = args[1];
    return mknum(m.data[0], n.data[0], 0);
  },

  matrix(fpu, args) {
    // assert args.length == 3
    // assert args[0], args[1] are scalar
    // assert args[2].formula
    const m = args[0].data[0],
      n = args[1].data[0],
      f = args[2];

    const idxi = mknum(1, 1, 0),
      idxi_data = idxi.data;

    const idxj = mknum(1, 1, 0),
      idxj_data = idxj.data;

    const idx = [idxi, idxj];

    const result = mknum(Math.floor(m), Math.floor(n), 0),
      data = result.data;

    for (let i = 0; i < m; ++i) {
      const irow = i * n;
      idxi_data[0] = i;
      for (let j = 0; j < n; ++j) {
        idxj_data[0] = j;
        data[irow + j] = fpu.evaluate(f.formula!, idx).data[0];
      }
    }

    return result;
  },

  length(fpu, args) {
    const x = args[0];

    // assert(X)
    const result = mknum(1, 1);
    result.data[0] = x.data.length;
    return result;
  },

  min(fpu, args) {
    const result = mknum(1, 1, Infinity);

    // assert args.length > 1
    for (let i = 0; i < args.length; ++i)
      for (let j = 0; j < args[i].data.length; ++j)
        result.data[0] = Math.min(result.data[0], args[i].data[j]);

    return result;
  },

  max(fpu, args) {
    const result = mknum(1, 1, -Infinity);

    // assert args.length > 1
    for (let i = 0; i < args.length; ++i)
      for (let j = 0; j < args[i].data.length; ++j)
        result.data[0] = Math.max(result.data[0], args[i].data[j]);

    return result;
  },

  mean(fpu, args) {
    // assert args.length == 1
    const arg = args[0];

    const result = mknum(1, 1);
    let sum = 0.0;

    for (let i = 0; i < arg.data.length; ++i) sum += arg.data[i];

    result.data[0] = sum / arg.data.length;

    return result;
  },

  sum(fpu, args) {
    const arg = args[0];

    const result = mknum(1, 1);

    // TODO sumPrecise
    for (let i = 0; i < arg.data.length; ++i) result.data[0] += arg.data[i];

    return result;
  },

  norm(fpu, args) {
    const result = mknum(1, 1);
    result.data[0] = norm(args[0]);
    return result;
  },

  unit(fpu, args) {
    const x = args[0];

    const result = mknum(x.rows, x.cols);
    const length = norm(x);

    for (let i = 0; i < x.data.length; ++i) result.data[i] = x.data[i] / length;

    return result;
  },

  conv(fpu, args) {
    const lhs = args[0],
      rhs = args[1];

    // assert(lhs.rows == 1, rhs.rows == 1)
    const result = mknum(1, lhs.cols + rhs.cols - 1);

    for (let i = 0; i < lhs.cols; ++i) {
      for (let j = 0; j < rhs.cols; ++j) {
        result.data[i + j] += lhs.data[i] * rhs.data[j];
      }
    }

    return result;
  },

  iterate(fpu, args) {
    const f = args[0],
      n = args[1],
      x0 = args[2];
    // assert f.formula, n, x0
    let result = x0;
    const idx = mknum(1, 1, 0);

    for (idx.data[0] = 0; idx.data[0] < n.data[0]; ++idx.data[0])
      result = fpu.evaluate(f.formula!, [result, idx]);

    return result;
  },

  iterate2(fpu, args) {
    const f = args[0],
      n = args[1],
      x0 = args[2];
    // assert f.formula, n, x0
    const result = mknum(1, n.data[0], x0.data[0]);

    for (let i = 0; i < n.data[0]; ++i) {
      result.data[i] = fpu.evaluate(f.formula!, [x0]).data[0];
      x0.data[0] = result.data[i];
    }

    return result;
  },

  fold(fpu, args) {
    const idx = args[0],
      x0 = args[1],
      f = args[2];
    // assert f.formula, x0, idx

    let result = x0;
    const value = mknum(1, 1);

    // assert idx.rows = 1
    for (let i = 0; i < idx.data.length; ++i) {
      value.data[0] = idx.data[i];
      result = fpu.evaluate(f.formula!, [result, value]);
    }

    return result;
  },

  transpose(fpu, args) {
    const arg = args[0];

    const result = mknum(arg.cols, arg.rows);

    for (let i = 0; i < arg.rows; ++i) {
      for (let j = 0; j < arg.cols; ++j) {
        result.data[j * arg.rows + i] = arg.data[i * arg.cols + j];
      }
    }

    return result;
  },

  shift(fpu, args) {
    const arg = args[0],
      k = args[1];

    const result = mknum(arg.rows, arg.cols);

    for (let i = k.data[0]; i < result.data.length + k.data[0]; ++i) {
      result.data[i] = arg.data[i - k.data[0]];
    }

    return result;
  },

  dft_r(fpu, args) {
    const n = Math.floor(args[0].data[0]);

    const result = mknum(n, n),
      data = result.data,
      c = (-2 * Math.PI) / n,
      nsqrt = Math.sqrt(n);

    for (let i = 0; i < n; ++i)
      for (let j = 0; j < n; ++j) data[i * n + j] = Math.cos(c * i * j) / nsqrt;

    return result;
  },

  dft_i(fpu, args) {
    const n = Math.floor(args[0].data[0]);

    const result = mknum(n, n),
      data = result.data,
      c = (-2 * Math.PI) / n,
      nsqrt = Math.sqrt(n);

    for (let i = 0; i < n; ++i)
      for (let j = 0; j < n; ++j) data[i * n + j] = Math.sin(c * i * j) / nsqrt;

    return result;
  },

  fftshift(fpu, args) {
    const arg = args[0];
    const n = arg.cols;
    const half = n / 2;

    const result = mknum(arg.rows, arg.cols);

    if (n % 2 == 0) {
      // Even length: split in half
      for (let i = 0; i < half; ++i) {
        result.data[i] = arg.data[i + half];
        result.data[i + half] = arg.data[i];
      }
    } else {
      // Odd length: shift by ceil(n/2)
      const shift = (n + 1) / 2;
      for (let i = 0; i < n; ++i) {
        result.data[i] = arg.data[(i + shift) % n];
      }
    }

    return result;
  },
};

// The variables every script starts with: the constants of Math, lower-cased.
export const constants: Record<string, Value> = {};

const math = Object.entries(Object.getOwnPropertyDescriptors(Math));

for (const [id, { value }] of math) {
  if (typeof value == "number") {
    constants[id.toLowerCase()] = mknum(1, 1, value);
  } else if (value.length == 1) {
    // One-argument Math functions apply elementwise.
    const mathf: (x: number) => number = value;

    library[id] = function (fpu, args) {
      const num = args[0];

      const result = mknum(num.rows, num.cols);

      for (let i = 0; i < num.data.length; ++i)
        result.data[i] = mathf(num.data[i]);

      return result;
    };
  }
}

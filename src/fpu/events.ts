import { mknum, stringOf } from "./value";
import type { Builtin } from "./vm";

// Identifies a parameter by the name the script gives it.
export type ParamId = string;

// One curve of a figure, through the points (x[i], y[i]).
export interface Series {
  x: Float64Array;
  y: Float64Array;
}

// What a running script tells its host, which is what renders it.
export type Event =
  | { type: "param"; id: ParamId; range: Float64Array; value: number }
  | {
      type: "plot";
      figure: number;
      chart: "line" | "scatter";
      series: Series[];
    }
  | {
      type: "limits";
      figure: number;
      axis: "x" | "y";
      min: number;
      max: number;
    };

// `plot(fid, X1, Y1, X2, Y2, ...)` draws a figure with one series per pair.
function chart(type: "line" | "scatter"): Builtin {
  return (vm, args) => {
    // assert args.length % 2 == 1
    const series: Series[] = [];

    // the data is copied, as the script may go on to change it
    for (let i = 1; i < args.length; i += 2)
      series.push({ x: args[i].data.slice(), y: args[i + 1].data.slice() });

    vm.emit({ type: "plot", figure: args[0].data[0], chart: type, series });

    return args[0];
  };
}

// `xlim(fid, [min max])` fixes the extent of a figure's axis.
function limits(axis: "x" | "y"): Builtin {
  return (vm, args) => {
    // assert args.length == 2
    // assert args[1].cols == 2
    const [min, max] = args[1].data;

    vm.emit({ type: "limits", figure: args[0].data[0], axis, min, max });

    return args[0];
  };
}

// The builtins through which a script reaches its host.
export const emitters: Record<string, Builtin> = {
  // `param(name, range, initial)` declares a parameter. It evaluates to the
  // value the host has set, and to the initial value until there is one.
  param(vm, args) {
    // assert args.length == 2 || args.length == 3
    // assert args[1].rows == 1
    if (!args[0].text) throw "param: the name must be a string";

    const id = stringOf(args[0]);
    const range = args[1].data;
    const initial = args[2] ? args[2].data[0] : range[0];
    const value = vm.params.get(id) ?? initial;

    vm.emit({ type: "param", id, range: range.slice(), value });

    return mknum(1, 1, value);
  },

  plot: chart("line"),
  scatter: chart("scatter"),

  xlim: limits("x"),
  ylim: limits("y"),
};

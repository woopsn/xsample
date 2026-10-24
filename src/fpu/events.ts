import { mknum, stringOf } from "./value";
import type { Builtin } from "./vm";

// Identifies a parameter by the name the script gives it.
export type ParamId = string;

// One curve of a figure, through the points (x[i], y[i]).
export interface Series {
  x: Float64Array;
  y: Float64Array;
}

// What `figure` can set of a figure, besides what it plots.
export interface FigureProperties {
  name?: string;
}

// What a running script tells its host, which is what renders it.
export type Event =
  | { type: "param"; id: ParamId; range: Float64Array; value: number }
  | { type: "hint"; id: ParamId; hint: string }
  | { type: "figure"; figure: number; properties: FigureProperties }
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

// `plot(X1, Y1, X2, Y2, ...)` draws the current figure with one series per
// pair.
function chart(type: "line" | "scatter"): Builtin {
  return (vm, args) => {
    // assert args.length % 2 == 0
    const series: Series[] = [];

    // the data is copied, as the script may go on to change it
    for (let i = 0; i < args.length; i += 2)
      series.push({ x: args[i].data.slice(), y: args[i + 1].data.slice() });

    vm.emit({ type: "plot", figure: vm.figure, chart: type, series });

    return mknum(1, 1, vm.figure);
  };
}

// `xlim([min max])` fixes the extent of the current figure's axis.
function limits(axis: "x" | "y"): Builtin {
  return (vm, args) => {
    // assert args.length == 1
    // assert args[0].cols == 2
    const [min, max] = args[0].data;

    vm.emit({ type: "limits", figure: vm.figure, axis, min, max });

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
    if (!args[0].text) throw new Error("param: the name must be a string");

    const id = stringOf(args[0]);
    const range = args[1].data;
    const initial = args[2] ? args[2].data[0] : range[0];
    const value = vm.params.get(id) ?? initial;

    vm.emit({ type: "param", id, range: range.slice(), value });

    return mknum(1, 1, value);
  },

  // `phint(name, hint)` describes a parameter, for its control.
  phint(vm, args) {
    // assert args.length == 2
    if (!args[0].text) throw new Error("phint: the name must be a string");
    if (!args[1].text) throw new Error("phint: the hint must be a string");

    vm.emit({ type: "hint", id: stringOf(args[0]), hint: stringOf(args[1]) });

    return args[1];
  },

  // `figure(id, "name", name)` makes a figure the current one, which later
  // plots draw, and sets its properties.
  figure(vm, args) {
    // assert args.length % 2 == 1
    const properties: FigureProperties = {};

    for (let i = 1; i < args.length; i += 2) {
      const [property, value] = [args[i], args[i + 1]];

      if (!property.text)
        throw new Error("figure: a property must be named by a string");
      if (stringOf(property) != "name")
        throw new Error("figure: unknown property: " + stringOf(property));
      if (!value?.text) throw new Error("figure: the name must be a string");

      properties.name = stringOf(value);
    }

    vm.figure = args[0].data[0];
    vm.emit({ type: "figure", figure: vm.figure, properties });

    return args[0];
  },

  plot: chart("line"),
  scatter: chart("scatter"),

  xlim: limits("x"),
  ylim: limits("y"),
};

import { mknum, stringOf } from "./value";
import type { Builtin } from "./vm";

// Identifies a parameter by the name the script gives it.
export type ParamId = string;

// One curve of a figure, through the points (x[i], y[i]).
export interface Series {
  x: Float64Array;
  y: Float64Array;
}

// What `title`, `xlabel`, `ylabel` and `legend` set of a figure.
export interface FigureProperties {
  title?: string;
  xlabel?: string;
  ylabel?: string;
  // the name of each series, in order
  legend?: string[];
}

// What a running script tells its host, which is what renders it.
export type Event =
  | {
      type: "param";
      id: ParamId;
      range: Float64Array;
      value: number;
      hint?: string;
    }
  // a figure is chosen, or some of its properties are set
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

// `title("Orbits")` sets a property of the current figure: its title, or
// the label of an axis.
function property(name: "title" | "xlabel" | "ylabel"): Builtin {
  return (vm, args) => {
    // assert args.length == 1
    if (!args[0].text) throw new Error(`${name}: the text must be a string`);

    const properties = { [name]: stringOf(args[0]) };
    vm.emit({ type: "figure", figure: vm.figure, properties });

    return args[0];
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
  // `param(name, range, initial, hint)` declares a parameter; the initial
  // value and the hint, a string describing it for its control, are each
  // optional. It evaluates to the value the host has set, and to the initial
  // value until there is one.
  param(vm, args) {
    // assert 2 <= args.length && args.length <= 4
    // assert args[1].rows == 1
    if (!args[0].text) throw new Error("param: the name must be a string");

    // a string after the range is the hint, and comes last
    const [name, range, ...rest] = args;
    const hint = rest.at(-1)?.text ? rest.at(-1) : undefined;
    const [initial] = hint ? rest.slice(0, -1) : rest;
    if (initial?.text)
      throw new Error("param: the initial value must be a number");

    const id = stringOf(name);
    const value = vm.params.get(id) ?? initial?.data[0] ?? range.data[0];

    vm.emit({
      type: "param",
      id,
      range: range.data.slice(),
      value,
      hint: hint && stringOf(hint),
    });

    return mknum(1, 1, value);
  },

  // `figure(id)` makes a figure the current one, which later calls draw on
  // and set the properties of.
  figure(vm, args) {
    if (args.length != 1)
      throw new Error("figure: takes only the figure's number");

    vm.figure = args[0].data[0];
    vm.emit({ type: "figure", figure: vm.figure, properties: {} });

    return args[0];
  },

  title: property("title"),
  xlabel: property("xlabel"),
  ylabel: property("ylabel"),

  // `legend(name1, name2, ...)` names the series of the current figure, in
  // the order it plots them.
  legend(vm, args) {
    if (!args.every((arg) => arg.text))
      throw new Error("legend: each name must be a string");

    const properties = { legend: args.map(stringOf) };
    vm.emit({ type: "figure", figure: vm.figure, properties });

    return mknum(1, 1, vm.figure);
  },

  plot: chart("line"),
  scatter: chart("scatter"),

  xlim: limits("x"),
  ylim: limits("y"),
};

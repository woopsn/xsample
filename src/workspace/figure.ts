import type { Event, Series } from "../fpu/events";

export type Limits = [min: number, max: number];

// A figure as a run has drawn it so far.
export interface Figure {
  chart: "line" | "scatter";
  series: Series[];

  // The extent of an axis, where the script has fixed it.
  x?: Limits;
  y?: Limits;
}

// The figures of a run by id, in the order the script first drew them.
export type Figures = Map<number, Figure>;

// Applies an event to the figures of the run that emitted it.
export function draw(
  figures: Figures,
  event: Extract<Event, { type: "plot" | "limits" }>,
): void {
  const figure: Figure = figures.get(event.figure) ?? {
    chart: "line",
    series: [],
  };

  if (event.type == "plot")
    figures.set(event.figure, {
      ...figure,
      chart: event.chart,
      series: event.series,
    });
  else
    figures.set(event.figure, {
      ...figure,
      [event.axis]: [event.min, event.max],
    });
}

// The figures to show while a run is in progress: what it has drawn so far,
// over what was shown before it. A figure keeps the limits it had until the
// run ends, so that it does not rescale between a `plot` and the `ylim`
// that follows it.
export function overlay(shown: Figures, drawn: Figures): Figures {
  const figures = new Map(shown);

  for (const [id, figure] of drawn)
    figures.set(id, { ...shown.get(id), ...figure });

  return figures;
}

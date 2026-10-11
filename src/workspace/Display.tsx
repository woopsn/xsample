import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { Series } from "../fpu/events";
import type { Figure, Figures } from "./figure";

const HEIGHT = 300;

// The colour of each series, in order.
const COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#6250d6",
  "#e34948",
];

// The figures of the page, each drawn with uPlot.
export function Display({ figures }: { figures: Figures }) {
  return [...figures].map(([id, figure]) => (
    <fieldset key={id} className="display">
      <legend>Figure {id}</legend>
      <Plot figure={figure} />
    </fieldset>
  ));
}

function Plot({ figure }: { figure: Figure }) {
  const element = useRef<HTMLDivElement>(null);

  // The chart, and what of the figure it was built for.
  const built = useRef<{ plot: uPlot; shape: string }>(null);

  // A chart is only given new data, unless the shape of the figure changed:
  // then it is built again.
  useEffect(() => {
    const { chart, series, x, y } = figure;
    const shape = JSON.stringify([chart, series.length, x, y]);

    if (built.current?.shape == shape) {
      built.current.plot.setData(align(series));
      return;
    }

    const parent = element.current!;

    built.current?.plot.destroy();
    built.current = {
      plot: new uPlot(
        options(figure, parent.clientWidth),
        align(series),
        parent,
      ),
      shape,
    };
  }, [figure]);

  useEffect(() => {
    const parent = element.current!;

    const observer = new ResizeObserver(() =>
      built.current?.plot.setSize({
        width: parent.clientWidth,
        height: HEIGHT,
      }),
    );
    observer.observe(parent);

    return () => {
      observer.disconnect();
      built.current?.plot.destroy();
      built.current = null;
    };
  }, []);

  return <div ref={element} />;
}

function options(figure: Figure, width: number): uPlot.Options {
  return {
    width,
    height: HEIGHT,
    scales: {
      x: { time: false, range: figure.x },
      y: { range: figure.y },
    },
    series: [
      { label: "x" },
      ...figure.series.map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const label = "y" + (i + 1);

        return figure.chart == "scatter"
          ? {
              label,
              stroke: color,
              paths: () => null,
              points: { show: true, size: 3, fill: color },
            }
          : { label, stroke: color, width: 2, points: { show: false } };
      }),
    ],
  };
}

// uPlot draws every series against one array of x values, so the series are
// joined on theirs.
function align(series: Series[]): uPlot.AlignedData {
  if (series.length == 0) return [[]];

  return uPlot.join(series.map(({ x, y }) => [x, y]));
}

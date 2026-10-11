import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { Series } from "../fpu/events";
import type { Figure, Figures as FiguresById } from "./figures";

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

export function Figures({ figures }: { figures: FiguresById }) {
  return [...figures].map(([id, figure]) => (
    <fieldset key={id} className="display">
      <legend>Figure {id}</legend>
      <Plot figure={figure} />
    </fieldset>
  ));
}

function Plot({ figure }: { figure: Figure }) {
  const { chart, series, x, y } = figure;

  const element = useRef<HTMLDivElement>(null);
  const plot = useRef<uPlot>(null);

  // The chart is built again when its shape changes, and otherwise only
  // given the new data.
  useEffect(() => {
    const parent = element.current!;
    const built = new uPlot(
      options(figure, parent.clientWidth),
      align(series),
      parent,
    );

    const observer = new ResizeObserver(() =>
      built.setSize({ width: parent.clientWidth, height: HEIGHT }),
    );
    observer.observe(parent);

    plot.current = built;

    return () => {
      observer.disconnect();
      built.destroy();
    };
  }, [chart, series.length, x?.[0], x?.[1], y?.[0], y?.[1]]);

  useEffect(() => plot.current!.setData(align(series)), [series]);

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

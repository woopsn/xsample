import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ParamId } from "../fpu/events";
import { Runner } from "../xsampler/runner";
import { Figures } from "./Figures";
import { draw, overlay } from "./figures";
import type { Figures as FiguresById } from "./figures";
import { Parameters } from "./Parameters";
import type { Param } from "./Parameters";

interface Props {
  // The textarea holding the script.
  source: HTMLTextAreaElement;
  // Where the figures go: the parameters are rendered in place.
  display: Element;
}

// Runs the script when it is submitted or a parameter changes, and renders
// the figures it draws and the controls for the parameters it declares.
export function App({ source, display }: Props) {
  const [runner] = useState(() => new Runner());
  const [params, setParams] = useState<Param[]>([]);

  // The values set on the controls.
  const [values, setValues] = useState(new Map<ParamId, number>());

  const [figures, setFigures] = useState<FiguresById>(new Map());
  const frame = useRef(0);

  // Shows figures at the next animation frame. Of the updates that arrive
  // before it, only the last is drawn.
  function show(update: (shown: FiguresById) => FiguresById) {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setFigures(update));
  }

  function run(values: Map<ParamId, number>) {
    const declared: Param[] = [];
    const drawn: FiguresById = new Map();

    runner.run({ source: source.value, params: values }, (message) => {
      switch (message.type) {
        case "param":
          declared.push(message);
          break;

        case "plot":
        case "limits":
          draw(drawn, message);
          show((shown) => overlay(shown, drawn));
          break;

        // what the run did not declare or draw is removed
        case "done":
          setParams(declared);
          show(() => drawn);
          break;
      }
    });
  }

  function change(id: ParamId, value: number) {
    const changed = new Map(values).set(id, value);

    setValues(changed);
    run(changed);
  }

  useEffect(() => run(values), []);

  useEffect(() => {
    const form = source.form!;
    const submit = (e: SubmitEvent) => {
      e.preventDefault();
      run(values);
    };

    form.addEventListener("submit", submit);
    return () => form.removeEventListener("submit", submit);
  });

  return (
    <>
      {createPortal(<Figures figures={figures} />, display)}
      <Parameters
        params={params.map((p) => ({
          ...p,
          value: values.get(p.id) ?? p.value,
        }))}
        onChange={change}
      />
    </>
  );
}

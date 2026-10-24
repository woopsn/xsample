import { useCallback, useEffect, useRef, useState } from "react";
import type { ParamId } from "../fpu/events";
import { Runner } from "../xsampler/runner";
import { Display } from "./Display";
import { draw, overlay } from "./figure";
import type { Figures } from "./figure";
import { Parameters } from "./Parameters";
import type { Param } from "./Parameters";

type Values = Map<ParamId, number>;

// The workspace of a page: the script, the controls for the parameters it
// declares and the figures it draws. The script runs when it is submitted
// and when a parameter changes. A description, in HTML, is shown beside the
// figures.
export function App({
  script,
  description,
}: {
  script: string;
  description?: string;
}) {
  const [runner] = useState(() => new Runner());
  const [source, setSource] = useState(script);
  const [params, setParams] = useState<Param[]>([]);

  // The values set on the controls.
  const [values, setValues] = useState<Values>(new Map());

  const [figures, setFigures] = useState<Figures>(new Map());
  const frame = useRef(0);

  const run = useCallback(
    (source: string, values: Values) => {
      const declared: Param[] = [];
      const drawn: Figures = new Map();

      // Shows figures at the next animation frame. Of the updates that
      // arrive before it, only the last is drawn.
      function show(update: (shown: Figures) => Figures) {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => setFigures(update));
      }

      runner.run({ source, params: values }, (message) => {
        switch (message.type) {
          case "param":
            declared.push(message);
            break;

          case "figure":
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
    },
    [runner],
  );

  useEffect(() => {
    run(script, new Map());

    return () => {
      runner.stop();
      cancelAnimationFrame(frame.current);
    };
  }, [run, runner, script]);

  function change(id: ParamId, value: number) {
    const changed = new Map(values).set(id, value);

    setValues(changed);
    run(source, changed);
  }

  return (
    <>
      <div className="figures">
        <div className="flex-parent">
          <Display figures={figures} />
        </div>

        {description && (
          <details className="description" open>
            <summary>Description</summary>
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </details>
        )}
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(source, values);
        }}
      >
        <div className="flex-parent">
          <fieldset className="flex">
            <legend>Source</legend>

            <textarea
              rows={8}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </fieldset>

          <fieldset className="parameters">
            <legend>Parameters</legend>

            <Parameters
              params={params.map((p) => ({
                ...p,
                value: values.get(p.id) ?? p.value,
              }))}
              onChange={change}
            />
          </fieldset>
        </div>

        <div className="actions">
          <input type="submit" value="Calculate" />
        </div>
      </form>
    </>
  );
}

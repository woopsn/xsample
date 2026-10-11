import { useEffect, useState } from "react";
import type { ParamId } from "../fpu/events";
import { Runner } from "../xsampler/runner";
import type { Message } from "../xsampler/worker";
import { Parameters } from "./Parameters";
import type { Param } from "./Parameters";

interface Props {
  // The textarea holding the script.
  source: HTMLTextAreaElement;
  // Renders the figures of a run.
  figures: { handle(message: Message): void };
}

// Runs the script when it is submitted or a parameter changes, and renders
// the controls for the parameters it declares.
export function App({ source, figures }: Props) {
  const [runner] = useState(() => new Runner());
  const [params, setParams] = useState<Param[]>([]);

  // The values set on the controls.
  const [values, setValues] = useState(new Map<ParamId, number>());

  function run(values: Map<ParamId, number>) {
    const declared: Param[] = [];

    runner.run({ source: source.value, params: values }, (message) => {
      if (message.type == "param") {
        declared.push(message);
        return;
      }

      if (message.type == "done") setParams(declared);

      figures.handle(message);
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
    <Parameters
      params={params.map((p) => ({ ...p, value: values.get(p.id) ?? p.value }))}
      onChange={change}
    />
  );
}

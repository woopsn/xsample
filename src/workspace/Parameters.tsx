import { useId, useState } from "react";
import type { Event, ParamId } from "../fpu/events";

// A parameter as the script declared it, with the value it took and the hint
// it was given, if any.
export type Param = Extract<Event, { type: "param" }> & { hint?: string };

interface Props {
  params: Param[];
  onChange: (id: ParamId, value: number) => void;
}

// A list of the parameters, with a control for each.
export function Parameters({ params, onChange }: Props) {
  return (
    <ul>
      {params.map((param) => (
        <li key={param.id}>
          <Parameter
            param={param}
            onChange={(value) => onChange(param.id, value)}
          />
        </li>
      ))}
    </ul>
  );
}

// A slider over the parameter's range, and a box for typing any value.
function Parameter({
  param: { id, range, value, hint },
  onChange,
}: {
  param: Param;
  onChange: (value: number) => void;
}) {
  const min = range[0];
  const max = range[range.length - 1];
  const step = (max - min) / (range.length - 1);

  const slider = useId();
  const box = useId();

  // What is typed in the box, while it is not a number.
  const [draft, setDraft] = useState<string>();

  function change(value: number) {
    setDraft(undefined);
    onChange(value);
  }

  return (
    <div className="field">
      <label htmlFor={slider}>{id}:</label>
      {/* the slider picks an index, as a range need not be evenly spaced */}
      <input
        id={slider}
        type="range"
        min={0}
        max={range.length - 1}
        value={nearest(range, value)}
        onChange={(e) => change(range[e.target.valueAsNumber])}
      />
      <div className="value">
        <label htmlFor={box}>:=</label>
        <input
          id={box}
          type="number"
          min={min}
          max={max}
          step={step / 4}
          value={draft ?? value}
          onChange={(e) => {
            if (Number.isNaN(e.target.valueAsNumber)) setDraft(e.target.value);
            else change(e.target.valueAsNumber);
          }}
        />
        {hint && <div className="hint">{hint}</div>}
      </div>
    </div>
  );
}

// The index of the element of a range that is closest to a value.
function nearest(range: Float64Array, value: number): number {
  let index = 0;

  range.forEach((x, i) => {
    if (Math.abs(x - value) < Math.abs(range[index] - value)) index = i;
  });

  return index;
}

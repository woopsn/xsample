import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// A textarea for the script, with its line numbers in a gutter on the left.
// Lines do not wrap, so that each stays level with its number.
export function Editor({ value, onChange }: Props) {
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;

  return (
    <div className="editor">
      <div className="gutter" ref={gutter} aria-hidden>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      <textarea
        rows={8}
        wrap="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          gutter.current!.scrollTop = e.currentTarget.scrollTop;
        }}
      />
    </div>
  );
}

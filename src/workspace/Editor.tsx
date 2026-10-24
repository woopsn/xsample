import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  // The line of the script's error, counting from 1, if it has one.
  errorLine?: number;
}

// A textarea for the script, with its line numbers in a gutter on the left,
// where the line of an error is marked. Lines do not wrap, so that each stays
// level with its number. Ctrl+Enter (Cmd+Enter on a Mac) submits its form.
export function Editor({ value, onChange, errorLine }: Props) {
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;

  return (
    <div className="editor">
      <div className="gutter" ref={gutter} aria-hidden>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={i + 1 == errorLine ? "error-line" : undefined}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <textarea
        rows={8}
        wrap="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        onScroll={(e) => {
          gutter.current!.scrollTop = e.currentTarget.scrollTop;
        }}
      />
    </div>
  );
}

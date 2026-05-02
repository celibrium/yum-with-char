"use client";

import { useState } from "react";

export type InstructionDraft = { step: string };

export function InstructionEditor({
  initial,
  onChange,
}: {
  initial: InstructionDraft[];
  onChange: (rows: InstructionDraft[]) => void;
}) {
  const [rows, setRows] = useState<InstructionDraft[]>(
    initial.length > 0 ? initial : [{ step: "" }],
  );

  function update(next: InstructionDraft[]) {
    setRows(next);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 w-6 text-sm text-[var(--color-ink-soft)] tabular-nums">
            {i + 1}.
          </span>
          <textarea
            value={r.step}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { step: e.target.value };
              update(next);
            }}
            rows={2}
            className="flex-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white"
            placeholder="Describe this step..."
            required
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => {
                if (i === 0) return;
                const c = [...rows];
                [c[i - 1], c[i]] = [c[i], c[i - 1]];
                update(c);
              }}
              className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
              aria-label="Move step up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => {
                if (i === rows.length - 1) return;
                const c = [...rows];
                [c[i], c[i + 1]] = [c[i + 1], c[i]];
                update(c);
              }}
              className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-accent)]"
              aria-label="Move step down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => update(rows.filter((_, j) => j !== i))}
              className="text-xs text-red-700 hover:text-red-900"
              aria-label="Remove step"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...rows, { step: "" }])}
        className="text-sm rounded-full border border-dashed border-[var(--color-border)] px-3 py-1 hover:bg-[var(--color-accent-soft)]"
      >
        + Add step
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

export type IngredientDraft = {
  quantity: number | null;
  unit: string | null;
  name: string;
  notes: string | null;
};

export function IngredientEditor({
  initial,
  onChange,
}: {
  initial: IngredientDraft[];
  onChange: (rows: IngredientDraft[]) => void;
}) {
  const [rows, setRows] = useState<IngredientDraft[]>(
    initial.length > 0
      ? initial
      : [{ quantity: null, unit: null, name: "", notes: null }],
  );

  function update(next: IngredientDraft[]) {
    setRows(next);
    onChange(next);
  }

  function addRow() {
    update([...rows, { quantity: null, unit: null, name: "", notes: null }]);
  }

  function removeRow(idx: number) {
    update(rows.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const copy = [...rows];
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
    update(copy);
  }

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:items-center rounded-lg sm:rounded-none border border-[var(--color-border)] sm:border-0 p-3 sm:p-0"
        >
          <input
            type="number"
            step="any"
            placeholder="Qty"
            value={r.quantity ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              const next = [...rows];
              next[i] = {
                ...r,
                quantity: v === "" ? null : Number(v),
              };
              update(next);
            }}
            className="col-span-1 sm:col-span-2 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm bg-white"
          />
          <input
            type="text"
            placeholder="Unit"
            value={r.unit ?? ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...r, unit: e.target.value || null };
              update(next);
            }}
            className="col-span-1 sm:col-span-2 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm bg-white"
          />
          <input
            type="text"
            placeholder="Ingredient name"
            value={r.name}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...r, name: e.target.value };
              update(next);
            }}
            className="col-span-2 sm:col-span-4 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm bg-white"
            required
          />
          <input
            type="text"
            placeholder="Notes"
            value={r.notes ?? ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = { ...r, notes: e.target.value || null };
              update(next);
            }}
            className="col-span-2 sm:col-span-3 rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-sm bg-white"
          />
          <div className="col-span-2 sm:col-span-1 flex justify-end gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              className="h-9 w-9 sm:h-7 sm:w-7 grid place-items-center rounded-full text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              className="h-9 w-9 sm:h-7 sm:w-7 grid place-items-center rounded-full text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="h-9 w-9 sm:h-7 sm:w-7 grid place-items-center rounded-full text-red-700 hover:text-red-900 hover:bg-red-50"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-sm rounded-full border border-dashed border-[var(--color-border)] px-3 py-1 hover:bg-[var(--color-accent-soft)]"
      >
        + Add ingredient
      </button>
    </div>
  );
}

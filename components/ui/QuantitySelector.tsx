"use client";

import { Button } from "./Button";

export function QuantitySelector({ value, onChange, min = 1 }: { value: number; min?: number; onChange: (value: number) => void }) {
  return (
    <div aria-label="Quantity selector" style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
      <Button type="button" variant="secondary" onClick={() => onChange(Math.max(min, value - 1))}>-</Button>
      <output aria-live="polite">{value}</output>
      <Button type="button" variant="secondary" onClick={() => onChange(value + 1)}>+</Button>
    </div>
  );
}

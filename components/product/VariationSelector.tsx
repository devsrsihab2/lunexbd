"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { Product } from "@/types/product.types";

export function VariationSelector({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const variationAttributes = product.attributes?.filter((attribute) => attribute.variation) || [];
  const selectedVariation = useMemo(
    () =>
      product.variations?.find((variation) =>
        Object.entries(variation.attributes).every(([key, value]) => selected[key] === value),
      ),
    [product.variations, selected],
  );

  if (!variationAttributes.length) {
    return null;
  }

  return (
    <div className="stack">
      {variationAttributes.map((attribute) => (
        <Select
          key={attribute.name}
          label={attribute.name}
          value={selected[attribute.name] || ""}
          onChange={(event) => setSelected((current) => ({ ...current, [attribute.name]: event.target.value }))}
          options={[{ label: `Choose ${attribute.name}`, value: "" }, ...attribute.options.map((option) => ({ label: option, value: option }))]}
        />
      ))}
      <Button type="button" disabled={product.type === "variable" && !selectedVariation}>
        Add to cart
      </Button>
    </div>
  );
}

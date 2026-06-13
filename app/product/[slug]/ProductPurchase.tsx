"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { addCartItem, rememberCartProductImage } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";
import styles from "./product-detail.module.scss";

export function ProductPurchase({ product }: { product: Product }) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const variationAttributes =
    product.attributes?.filter((attribute) => attribute.variation) || [];

  const selectedVariation = useMemo(
    () =>
      product.variations?.find((variation) =>
        Object.entries(variation.attributes).every(
          ([key, value]) => selected[key] === value,
        ),
      ),
    [product.variations, selected],
  );

  const variationId =
    product.type === "variable" ? selectedVariation?.id : product.variations?.[0]?.id;
  const canAdd = product.type !== "variable" || Boolean(selectedVariation);
  const checkoutHref = `/checkout?productId=${product.id}${
    variationId ? `&variationId=${variationId}` : ""
  }&quantity=${quantity}`;

  function updateQuantity(value: number) {
    setQuantity(Math.max(1, Number.isFinite(value) ? value : 1));
  }

  async function handleAddToCart() {
    if (isAdding) return;

    if (!canAdd) {
      setError("Please choose product options first.");
      return;
    }

    setIsAdding(true);
    setAdded(false);
    setError("");

    cartStore.setState({
      ...cartStore.getSnapshot(),
      loading: true,
      error: undefined,
    });

    rememberCartProductImage(
      product.id,
      selectedVariation?.image || product.images?.[0],
      variationId,
    );

    const response = await addCartItem({
      productId: product.id,
      variationId,
      quantity,
      variation: selectedVariation?.attributes,
    });

    if (response.success) {
      cartStore.setState({
        ...cartStore.getSnapshot(),
        cart: response.data,
        loading: false,
        error: undefined,
      });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1400);
    } else {
      const message = response.message || "Could not add this product.";
      setError(message);
      cartStore.setState({
        ...cartStore.getSnapshot(),
        loading: false,
        error: message,
      });
    }

    setIsAdding(false);
  }

  return (
    <>
      {variationAttributes.length ? (
        <div className={styles.variationFields}>
          {variationAttributes.map((attribute) => (
            <Select
              key={attribute.name}
              label={attribute.name}
              value={selected[attribute.name] || ""}
              onChange={(event) =>
                setSelected((current) => ({
                  ...current,
                  [attribute.name]: event.target.value,
                }))
              }
              options={[
                { label: `Choose ${attribute.name}`, value: "" },
                ...attribute.options.map((option) => ({
                  label: option,
                  value: option,
                })),
              ]}
            />
          ))}
        </div>
      ) : null}

      <div className={styles.quantityRow}>
        <label htmlFor="quantity">Quantity:</label>
        <div className={styles.quantityControl}>
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => updateQuantity(quantity - 1)}
          >
            -
          </button>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => updateQuantity(Number(event.target.value))}
            aria-label="Quantity"
          />
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => updateQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          onClick={handleAddToCart}
          loading={isAdding}
          disabled={!canAdd}
        >
          {added ? "Added" : "Add to Cart"}
        </Button>
        <Button
          href={canAdd ? checkoutHref : "#"}
          variant="secondary"
          disabled={!canAdd}
        >
          Buy Now
        </Button>
      </div>

      {error ? (
        <p className={styles.actionMessage} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

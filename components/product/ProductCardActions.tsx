"use client";

import { useState } from "react";
import { addCartItem, rememberCartProductImage } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";
import styles from "./ProductCard.module.scss";

export function ProductCardActions({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const variationId = product.variations?.[0]?.id;

  const checkoutHref = `/checkout?productId=${product.id}${
    variationId ? `&variationId=${variationId}` : ""
  }&quantity=1`;

  async function handleAddToCart() {
    if (isAdding) return;

    if (!product.id) {
      setError("Product ID is missing.");
      return;
    }

    setIsAdding(true);
    setError("");

    cartStore.setState({
      ...cartStore.getSnapshot(),
      loading: true,
      error: undefined,
    });

    rememberCartProductImage(
      product.id,
      product.variations?.[0]?.image || product.images?.[0],
      variationId,
    );

    const response = await addCartItem({
      productId: product.id,
      variationId,
      quantity: 1,
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
    <div className={styles.actions}>
      <a
        className={styles.orderButton}
        href={checkoutHref}
        aria-label={`Order ${product.name} now`}
      >
        Order Now
      </a>

      <button
        className={styles.cartButton}
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        aria-label={`Add ${product.name} to cart`}
        title={isAdding ? "Adding..." : added ? "Added" : "Add to cart"}
      >
        {added ? <CheckIcon /> : <CartIcon />}
      </button>

      {error ? (
        <p className={styles.actionError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.65 12.42a2 2 0 0 0 2 1.58h8.9a2 2 0 0 0 1.96-1.62L21 7H5.12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

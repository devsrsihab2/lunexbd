"use client";

import type { Cart } from "@/types/cart.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CartDrawer.module.scss";

export function StickyCartButton({ cart, itemCount, loading, onOpen }: { cart?: Cart | null; itemCount: number; loading?: boolean; onOpen: () => void }) {
  if (!itemCount) return null;

  return (
    <button className={styles.stickyCart} type="button" onClick={onOpen} aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}>
      <span className={styles.stickyIcon}>
        <CartIcon />
      </span>
      <strong>{loading ? "..." : `${itemCount} ${itemCount === 1 ? "Item" : "Items"}`}</strong>
      <em>{formatPrice(cart?.totals?.total || 0)}</em>
    </button>
  );
}

function CartIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

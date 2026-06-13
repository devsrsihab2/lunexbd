"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addWishlistItem } from "@/services/api/wishlist.api";
import type { Product } from "@/types/product.types";
import styles from "./product-detail.module.scss";

export function ProductWishlistAction({ product }: { product: Product }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(`/product/${product.slug}`)}`);
      return;
    }

    setSaving(true);
    setMessage("");

    const response = await addWishlistItem(product.id);

    setSaving(false);

    if (!response.success) {
      setMessage(response.message || "Could not save this product.");
      return;
    }

    setSaved(true);
    setMessage("Saved to your wishlist.");
  }

  return (
    <div className={styles.wishlistActionWrap}>
      <button
        className={saved ? `${styles.wishlistAction} ${styles.wishlistActionSaved}` : styles.wishlistAction}
        type="button"
        onClick={handleClick}
        disabled={saving}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z" />
        </svg>
        {saving ? "Saving..." : saved ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}

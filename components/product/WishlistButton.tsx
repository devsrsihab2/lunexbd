"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addWishlistItem } from "@/services/api/wishlist.api";
import styles from "./ProductCard.module.scss";

export function WishlistButton({ productId, productName }: { productId: number; productName: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleClick() {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent("/wishlist")}`);
      return;
    }

    setSaving(true);
    const response = await addWishlistItem(productId);
    setSaving(false);

    if (response.success) {
      setSaved(true);
    }
  }

  return (
    <button
      className={`${styles.wishlistButton} ${saved ? styles.wishlistSaved : ""}`}
      type="button"
      onClick={handleClick}
      disabled={saving}
      aria-label={`${saved ? "Saved" : "Save"} ${productName} to wishlist`}
      title={saved ? "Saved to wishlist" : "Add to wishlist"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.4 5.6a5.1 5.1 0 0 0-7.2 0L12 6.8l-1.2-1.2a5.1 5.1 0 0 0-7.2 7.2L12 21l8.4-8.2a5.1 5.1 0 0 0 0-7.2Z" />
      </svg>
    </button>
  );
}

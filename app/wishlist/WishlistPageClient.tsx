"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addCartItem, rememberCartProductImage } from "@/services/api/cart.api";
import { getWishlist, removeWishlistItem } from "@/services/api/wishlist.api";
import { cartStore } from "@/store/cart.store";
import type { ApiResponse } from "@/types/api.types";
import type { Product } from "@/types/product.types";
import type { Wishlist } from "@/types/wishlist.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./wishlist.module.scss";

type ItemState = Record<number, "adding" | "removing" | undefined>;

export function WishlistPageClient() {
  const [wishlist, setWishlist] = useState<ApiResponse<Wishlist> | null>(null);
  const [itemState, setItemState] = useState<ItemState>({});

  useEffect(() => {
    let active = true;

    getWishlist().then((response) => {
      if (active) setWishlist(response);
    });

    return () => {
      active = false;
    };
  }, []);

  async function removeItem(productId: number) {
    setItemState((current) => ({ ...current, [productId]: "removing" }));
    const response = await removeWishlistItem(productId);
    setItemState((current) => ({ ...current, [productId]: undefined }));
    setWishlist(response);
  }

  async function addToCart(product: Product) {
    const variationId = product.variations?.[0]?.id;

    setItemState((current) => ({ ...current, [product.id]: "adding" }));
    cartStore.setState({ ...cartStore.getSnapshot(), loading: true, error: undefined });
    rememberCartProductImage(product.id, product.variations?.[0]?.image || product.images?.[0], variationId);

    const response = await addCartItem({
      productId: product.id,
      variationId,
      quantity: 1,
    });

    if (response.success) {
      cartStore.setState({ ...cartStore.getSnapshot(), cart: response.data, loading: false, error: undefined });
    } else {
      cartStore.setState({ ...cartStore.getSnapshot(), loading: false, error: response.message });
    }

    setItemState((current) => ({ ...current, [product.id]: undefined }));
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p>Wishlist</p>
        <h1>Saved products</h1>
        <span>Keep your favorite Lunexbd items ready for checkout.</span>
      </section>

      {!wishlist ? (
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div className={styles.skeleton} key={index} />
          ))}
        </div>
      ) : !wishlist.success ? (
        <section className={styles.empty}>
          <strong>Login required</strong>
          <span>{wishlist.message || "Please login to view your wishlist."}</span>
          <Link href="/login?redirect=/wishlist">Login</Link>
        </section>
      ) : !wishlist.data.items.length ? (
        <section className={styles.empty}>
          <strong>Your wishlist is empty</strong>
          <span>Tap the heart icon on products to save them here.</span>
          <Link href="/products">Browse products</Link>
        </section>
      ) : (
        <section className={styles.grid} aria-label="Wishlist products">
          {wishlist.data.items.map((product) => {
            const image = product.images?.[0];
            const busy = itemState[product.id];

            return (
              <article className={styles.card} key={product.id}>
                <Link className={styles.image} href={`/product/${product.slug}`}>
                  {image?.src ? (
                    <img
                      src={image.src}
                      alt={image.alt || product.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <b>{product.name.slice(0, 1)}</b>
                  )}
                </Link>
                <div className={styles.body}>
                  <p>{product.stockStatus || "In stock"}</p>
                  <h2><Link href={`/product/${product.slug}`}>{product.name}</Link></h2>
                  <strong>{formatPrice(product.salePrice || product.price)}</strong>
                  <div className={styles.actions}>
                    <button type="button" onClick={() => addToCart(product)} disabled={Boolean(busy)}>
                      {busy === "adding" ? "Adding..." : "Add to cart"}
                    </button>
                    <button type="button" onClick={() => removeItem(product.id)} disabled={Boolean(busy)}>
                      {busy === "removing" ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

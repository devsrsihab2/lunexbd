"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "../AccountDashboard";
import { getWishlist, removeWishlistItem } from "@/services/api/wishlist.api";
import type { Wishlist } from "@/types/wishlist.types";
import styles from "../account.module.scss";
import wishlistStyles from "@/app/wishlist/wishlist.module.scss";
import { addCartItem, rememberCartProductImage } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";
import { formatPrice } from "@/utils/formatPrice";
import type { Product } from "@/types/product.types";

type ItemState = Record<number, "adding" | "removing" | undefined>;

export function AccountWishlistView() {
  const [data, setData] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemState, setItemState] = useState<ItemState>({});

  const fetchWishlist = async (p: number) => {
    setLoading(true);
    const res = await getWishlist(p, 10);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist(page);
  }, [page]);

  const handleRemove = async (productId: number) => {
    setItemState((current) => ({ ...current, [productId]: "removing" }));
    const res = await removeWishlistItem(productId);
    if (res.success) {
      // Refresh current page
      fetchWishlist(page);
    }
    setItemState((current) => ({ ...current, [productId]: undefined }));
  };

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
    <AccountShell
      eyebrow="Saved Products"
      title="Your Wishlist"
      description="View and manage the products you've saved for later."
    >
      {() => (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <Link
              href="/wishlist"
              className={styles.logoutButton} 
              style={{ minHeight: "2.5rem", fontSize: "0.9rem" }}
            >
              View Full Wishlist
            </Link>
          </div>

          {loading ? (
            <div className={wishlistStyles.grid}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div className={wishlistStyles.skeleton} key={index} />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <section className={wishlistStyles.grid} aria-label="Wishlist products">
                {data.items.map((product) => {
                  const image = product.images?.[0];
                  const busy = itemState[product.id];

                  return (
                    <article className={wishlistStyles.card} key={product.id}>
                      <Link className={wishlistStyles.image} href={`/product/${product.slug}`}>
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
                      <div className={wishlistStyles.body}>
                        <p>{product.stockStatus || "In stock"}</p>
                        <h2><Link href={`/product/${product.slug}`}>{product.name}</Link></h2>
                        <strong>{formatPrice(product.salePrice || product.price)}</strong>
                        <div className={wishlistStyles.actions}>
                          <button type="button" onClick={() => addToCart(product)} disabled={Boolean(busy)}>
                            {busy === "adding" ? "Adding..." : "Add to cart"}
                          </button>
                          <button type="button" onClick={() => handleRemove(product.id)} disabled={Boolean(busy)}>
                            {busy === "removing" ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              {/* Pagination controls */}
              {data.pagination && data.pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={styles.logoutButton}
                    style={{ minHeight: "2.5rem", padding: "0 1rem" }}
                  >
                    Previous
                  </button>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    Page {data.pagination.currentPage} of {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                    className={styles.logoutButton}
                    style={{ minHeight: "2.5rem", padding: "0 1rem" }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState} style={{ padding: "3rem", textAlign: "center", background: "var(--color-tint, #fbf2f1)", borderRadius: "8px" }}>
              <h3>Your wishlist is empty</h3>
              <p>Explore our shop and find something you love!</p>
              <Link href="/shop" className={styles.logoutButton} style={{ marginTop: "1rem" }}>
                Go to Shop
              </Link>
            </div>
          )}
        </div>
      )}
    </AccountShell>
  );
}

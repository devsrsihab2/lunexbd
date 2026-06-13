"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { getCart, removeCartItem, updateCartItem } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";
import type { Cart, CartItem } from "@/types/cart.types";
import { getCartItemImage } from "@/utils/cartImage";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CartDrawer.module.scss";

export function CartSidebar({ cart, itemCount, isOpen, onClose }: { cart?: Cart | null; itemCount: number; isOpen: boolean; onClose: () => void }) {
  const state = useCart();
  const [message, setMessage] = useState("");
  const checkoutHref = useMemo(() => {
    const first = cart?.items?.[0];
    if (!first) return "/checkout";
    return `/checkout?productId=${first.productId}${first.variationId ? `&variationId=${first.variationId}` : ""}&quantity=${first.quantity}`;
  }, [cart]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    getCart().then((response) => {
      if (response.success) {
        cartStore.setState({ ...cartStore.getSnapshot(), cart: response.data, error: undefined });
      }
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  async function updateQuantity(item: CartItem, quantity: number) {
    const nextQuantity = Math.max(0, quantity);
    cartStore.setState({ ...cartStore.getSnapshot(), updatingKey: item.key, error: undefined });
    setMessage("");

    const response = nextQuantity === 0 ? await removeCartItem(item.key) : await updateCartItem(item.key, nextQuantity);
    if (response.success) {
      cartStore.setState({ cart: response.data, updatingKey: undefined, error: undefined });
      return;
    }

    const error = response.message || "Cart update failed.";
    cartStore.setState({ ...cartStore.getSnapshot(), updatingKey: undefined, error });
    setMessage(error);
  }

  return (
    <div className={`${styles.drawerRoot} ${isOpen ? styles.open : ""}`} aria-hidden={!isOpen}>
      <button className={styles.backdrop} type="button" onClick={onClose} aria-label="Close cart" tabIndex={isOpen ? 0 : -1} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Shopping cart" tabIndex={isOpen ? 0 : -1} inert={!isOpen}>
        <header className={styles.drawerHeader}>
          <div>
            <span>Shopping Cart</span>
            <strong>{itemCount} {itemCount === 1 ? "item" : "items"}</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart">
            Close
            <ArrowIcon />
          </button>
        </header>

        {!cart?.items?.length ? (
          <div className={styles.empty}>
            <strong>Your cart is empty</strong>
            <p>Add products to see them here.</p>
            <Link href="/products" onClick={onClose}>Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {cart.items.map((item) => (
                <article key={item.key} className={styles.drawerItem}>
                  <Link className={styles.itemImage} href={getProductSearchHref(item)} onClick={onClose}>
                    <CartPhoto item={item} />
                  </Link>
                  <div className={styles.itemBody}>
                    <div className={styles.itemTitleRow}>
                      <Link href={getProductSearchHref(item)} onClick={onClose}>{item.name}</Link>
                      <button type="button" disabled={state.updatingKey === item.key} onClick={() => updateQuantity(item, 0)} aria-label={`Remove ${item.name}`}>
                        <CloseIcon />
                      </button>
                    </div>
                    <div className={styles.itemMeta}>
                      <QuantityControl item={item} disabled={state.updatingKey === item.key} onChange={updateQuantity} />
                      <span>x</span>
                      <strong>{formatPrice(item.price)}</strong>
                      <span>=</span>
                      <b>{formatPrice(item.total)}</b>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className={styles.drawerSummary} aria-label="Cart total">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(cart.totals.subtotal)}</strong>
              </div>
              {cart.totals.discount ? (
                <div>
                  <span>Discount</span>
                  <strong>-{formatPrice(cart.totals.discount)}</strong>
                </div>
              ) : null}
              <div className={styles.totalRow}>
                <span>Total:</span>
                <strong>{formatPrice(cart.totals.total)}</strong>
              </div>
              {message || state.error ? <p className={styles.error} role="alert">{message || state.error}</p> : null}
              <div className={styles.drawerActions}>
                <Link className={styles.viewCart} href="/cart" onClick={onClose}>View Cart</Link>
                <Link className={styles.checkout} href={checkoutHref} onClick={onClose}>Checkout</Link>
              </div>
            </section>
          </>
        )}
      </aside>
    </div>
  );
}

function getProductSearchHref(item: CartItem) {
  return `/products?search=${encodeURIComponent(item.name)}`;
}

function CartPhoto({ item }: { item: CartItem }) {
  const image = getCartItemImage(item);

  if (!image) {
    return <span className={styles.imageFallback} aria-hidden="true">{item.name.slice(0, 1)}</span>;
  }

  return <img src={image.src} alt={image.alt || item.name} loading="lazy" decoding="async" />;
}

function QuantityControl({ item, disabled, onChange }: { item: CartItem; disabled: boolean; onChange: (item: CartItem, quantity: number) => void }) {
  return (
    <div className={styles.qty} aria-label={`Quantity for ${item.name}`}>
      <button type="button" disabled={disabled} onClick={() => onChange(item, item.quantity - 1)}>-</button>
      <span>{item.quantity}</span>
      <button type="button" disabled={disabled} onClick={() => onChange(item, item.quantity + 1)}>+</button>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

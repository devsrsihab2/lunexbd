"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart, removeCartItem, updateCartItem } from "@/services/api/cart.api";
import { cartStore } from "@/store/cart.store";
import type { Cart, CartItem } from "@/types/cart.types";
import { getCartItemImage } from "@/utils/cartImage";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "@/hooks/useCart";
import styles from "./CartSummary.module.scss";

export function CartSummary({ cart: initialCart }: { cart?: Cart | null }) {
  const state = useCart();
  const cart = state.cart || initialCart;
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialCart && !cartStore.getSnapshot().cart) {
      cartStore.setState({ cart: initialCart });
    }
    getCart().then((response) => {
      if (response.success) cartStore.setState({ cart: response.data });
    });
  }, [initialCart]);

  const checkoutHref = useMemo(() => {
    const first = cart?.items?.[0];
    if (!first) return "/checkout";
    return `/checkout?productId=${first.productId}${first.variationId ? `&variationId=${first.variationId}` : ""}&quantity=${first.quantity}`;
  }, [cart]);

  async function updateQuantity(item: CartItem, quantity: number) {
    const nextQuantity = Math.max(0, quantity);
    cartStore.setState({ ...cartStore.getSnapshot(), updatingKey: item.key, error: undefined });
    const response = nextQuantity === 0 ? await removeCartItem(item.key) : await updateCartItem(item.key, nextQuantity);
    if (response.success) {
      cartStore.setState({ cart: response.data, updatingKey: undefined });
      setMessage("");
      return;
    }
    cartStore.setState({ ...cartStore.getSnapshot(), updatingKey: undefined, error: response.message });
    setMessage(response.message || "Cart update failed.");
  }

  if (!cart?.items?.length) {
    return (
      <section className={styles.emptyCart}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <CartEmptyIcon />
        </div>
        <span>Your bag is waiting</span>
        <h1>Your cart is empty</h1>
        <p>Discover Lunex bags, wallets and travel pieces, then come back here for a quick checkout.</p>
        <a href="/products">Continue shopping</a>
      </section>
    );
  }

  return (
    <section className={styles.cartPage} aria-label="Shopping cart">
      <div className={styles.heading}>
        <div>
          <h1>Shopping Cart</h1>
          <p>{cart.items.reduce((total, item) => total + item.quantity, 0)} items in your cart</p>
        </div>
        <a href="/products">Continue Shopping</a>
      </div>

      <div className={styles.layout}>
        <div className={styles.items}>
          {cart.items.map((item) => (
            <article key={item.key} className={styles.item}>
              <a className={styles.imageBox} href={`/product/${item.productId}`}>
                <CartSummaryPhoto item={item} />
              </a>
              <div className={styles.itemInfo}>
                <h2>{item.name}</h2>
                {item.attributes ? <p>{Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(", ")}</p> : null}
                <strong>{formatPrice(item.price)}</strong>
              </div>
              <div className={styles.quantity} aria-label={`Quantity for ${item.name}`}>
                <button type="button" disabled={state.updatingKey === item.key} onClick={() => updateQuantity(item, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button type="button" disabled={state.updatingKey === item.key} onClick={() => updateQuantity(item, item.quantity + 1)}>+</button>
              </div>
              <strong className={styles.total}>{formatPrice(item.total)}</strong>
              <button className={styles.remove} type="button" disabled={state.updatingKey === item.key} onClick={() => updateQuantity(item, 0)} aria-label={`Remove ${item.name}`}>
                x
              </button>
            </article>
          ))}
        </div>

        <aside className={styles.summary} aria-label="Cart totals">
          <h2>Order Summary</h2>
          <label className={styles.coupon}>
            <span>Coupon code</span>
            <div>
              <input placeholder="Enter coupon" />
              <button type="button">Apply</button>
            </div>
          </label>
          <dl>
            <div><dt>Subtotal</dt><dd>{formatPrice(cart.totals.subtotal)}</dd></div>
            {cart.totals.discount ? <div><dt>Discount</dt><dd>-{formatPrice(cart.totals.discount)}</dd></div> : null}
            <div><dt>Shipping</dt><dd>{formatPrice(cart.totals.shipping || 0)}</dd></div>
            <div><dt>Tax</dt><dd>{formatPrice(cart.totals.tax || 0)}</dd></div>
            <div className={styles.grand}><dt>Total</dt><dd>{formatPrice(cart.totals.total)}</dd></div>
          </dl>
          {message || state.error ? <p className={styles.error} role="alert">{message || state.error}</p> : null}
          <a className={styles.checkout} href={checkoutHref}>Proceed to Checkout</a>
        </aside>
      </div>
    </section>
  );
}

function CartSummaryPhoto({ item }: { item: CartItem }) {
  const image = getCartItemImage(item);
  if (!image) return <span className={styles.imageFallback} aria-hidden="true">{item.name.slice(0, 1)}</span>;

  return <img src={image.src} alt={image.alt || item.name} loading="lazy" decoding="async" />;
}

function CartEmptyIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
      <path d="M9 13h6" />
    </svg>
  );
}

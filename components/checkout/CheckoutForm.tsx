"use client";

import { useMemo, useState } from "react";
import { placeOrder } from "@/services/api/checkout.api";
import type { CheckoutLineItem, CheckoutOptions } from "@/types/checkout.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CheckoutForm.module.scss";

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const divisionAliases: Record<string, string[]> = {
  Chattogram: ["Chattogram", "Chittagong"],
  Barishal: ["Barishal", "Barisal"],
};

function normalizeLocation(value?: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function methodMatchesDivision(method: CheckoutOptions["shippingMethods"][number], division: string) {
  if (!division) return false;

  const targets = (divisionAliases[division] || [division]).map(normalizeLocation);
  const sources = [
    method.zoneName,
    method.title,
    ...(method.locations || []),
  ].map(normalizeLocation);

  const zoneName = normalizeLocation(method.zoneName);
  const isOutsideDhakaZone =
    zoneName.includes("outsidedhaka") ||
    zoneName.includes("outsideofdhaka") ||
    zoneName.includes("exceptdhaka") ||
    zoneName.includes("nondhaka");

  if (isOutsideDhakaZone) return division !== "Dhaka";

  return sources.some((source) => targets.some((target) => source.includes(target)));
}

export function CheckoutForm({ options, item }: { options?: CheckoutOptions | null; item?: CheckoutLineItem | null }) {
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const paymentMethods = useMemo(() => (options?.paymentMethods || []).filter((method) => method.enabled), [options?.paymentMethods]);
  const shippingMethods = useMemo(() => options?.shippingMethods || [], [options?.shippingMethods]);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const hasPaymentMethods = paymentMethods.length > 0;
  const hasShippingMethods = shippingMethods.length > 0;
  const paymentMethod = paymentMethods.some((method) => method.id === paymentMethodChoice)
    ? paymentMethodChoice
    : paymentMethods[0]?.id || "";
  const selectedShipping = useMemo(() => {
    if (!selectedDivision) return null;

    return shippingMethods.find((method) => methodMatchesDivision(method, selectedDivision)) || null;
  }, [selectedDivision, shippingMethods]);
  const shippingMethod = selectedShipping?.id || "";
  const subtotal = Number(item?.price || 0) * quantity;
  const shippingCost = Number(selectedShipping?.cost || 0);
  const total = subtotal + shippingCost;

  const summaryItem = useMemo<CheckoutLineItem>(() => ({
    productId: item?.productId || 0,
    variationId: item?.variationId,
    name: item?.name || "Select a product",
    quantity,
    price: item?.price || "0",
    image: item?.image,
  }), [item, quantity]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item?.productId) {
      setMessage("Please select a product before placing the order.");
      return;
    }
    if (!hasPaymentMethods) {
      setMessage("No payment method available.");
      return;
    }
    if (!hasShippingMethods) {
      setMessage("No delivery method available.");
      return;
    }
    if (!shippingMethod) {
      setMessage("No delivery method available.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") || "").trim();
    const [firstName, ...restName] = fullName.split(" ");
    const lastName = restName.join(" ") || firstName;

    const response = await placeOrder({
      item: summaryItem,
      paymentMethod,
      shippingMethod,
      coupon: formData.get("coupon"),
      notes: formData.get("notes"),
      billing: {
        firstName,
        lastName,
        email: formData.get("email"),
        phone: formData.get("phone"),
        address1: formData.get("address1"),
        city: formData.get("district"),
        state: selectedDivision,
        postcode: formData.get("area"),
        country: "BD",
      },
      shipping: {
        firstName,
        lastName,
        phone: formData.get("phone"),
        address1: formData.get("address1"),
        city: formData.get("district"),
        state: selectedDivision,
        postcode: formData.get("area"),
        country: "BD",
      },
    });

    setIsSubmitting(false);
    if (response.success) {
      const orderKey = response.data.orderKey || extractOrderKey(response.data.redirectUrl);
      const params = new URLSearchParams({ orderId: String(response.data.order.id) });

      if (orderKey) {
        params.set("orderKey", orderKey);
      }

      window.location.href = `/order-confirmation?${params.toString()}`;
      return;
    }
    setMessage(response.message || "Order could not be placed.");
  }

  return (
    <form className={styles.checkout} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <div className={styles.left}>
          <section className={styles.panel}>
            <h2>Order review</h2>
            <div className={styles.reviewItem}>
              <div className={styles.thumb}>
                {summaryItem.image ? <img src={summaryItem.image} alt={summaryItem.name} loading="lazy" decoding="async" /> : <span aria-hidden="true">{summaryItem.name.slice(0, 1)}</span>}
              </div>
              <div>
                <strong>{summaryItem.name}</strong>
                <div className={styles.qtyRow}>
                  <span>Qty.</span>
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <b>{quantity}</b>
                  <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Shipping Address</h2>
            <div className={styles.fields}>
              <input name="fullName" placeholder="Your Full Name *" required />
              <input name="phone" placeholder="017********" required />
              <input name="email" type="email" placeholder="Email address" />
              <input name="address1" placeholder="ex: House no. / building / street / area" required />
              <select name="division" required value={selectedDivision} onChange={(event) => setSelectedDivision(event.target.value)}>
                <option value="" disabled>Division</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>{division}</option>
                ))}
              </select>
              <input name="district" placeholder="District" required />
              <input name="area" placeholder="Area / Postcode" />
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Billing Address</h2>
            <label className={styles.same}><input type="checkbox" defaultChecked /> Same as shipping address</label>
          </section>
        </div>

        <div className={styles.right}>
          <section className={styles.panel}>
            <h2>Payment method</h2>
            {hasPaymentMethods ? (
              <div className={styles.methodGrid}>
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`${styles.method} ${paymentMethod === method.id ? styles.activeMethod : ""}`}>
                    <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethodChoice(method.id)} />
                    <span>{method.title}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMethod}>No payment method available.</p>
            )}
          </section>

          <section className={styles.panel}>
            <h2>Shipping method</h2>
            {!hasShippingMethods || (selectedDivision && !selectedShipping) ? (
              <p className={styles.emptyMethod}>No delivery method available.</p>
            ) : selectedShipping ? (
              <div className={styles.autoMethod}>
                <span>{selectedShipping.title}</span>
                <strong>{formatPrice(selectedShipping.cost)}</strong>
              </div>
            ) : (
              <p className={styles.helpText}>Select a division to see the delivery method.</p>
            )}
          </section>

          <section className={styles.panel}>
            <h2>Have any coupon or gift voucher?</h2>
            <input className={styles.fullControl} name="coupon" placeholder="Coupon code" disabled={!options?.couponsEnabled} />
          </section>

          <section className={styles.totals}>
            <div><span>Sub total</span><strong>{formatPrice(subtotal)}</strong></div>
            <div><span>Delivery cost</span><strong>{formatPrice(shippingCost)}</strong></div>
            <div><span>Total</span><strong>{formatPrice(total)}</strong></div>
          </section>

          <section className={styles.panel}>
            <h2>Special notes <small>(Optional)</small></h2>
            <textarea name="notes" maxLength={90} />
            <small>0 / 90 characters</small>
          </section>

          <label className={styles.terms}><input type="checkbox" required defaultChecked /> I have read and agree to the Terms and Conditions, Privacy Policy & Refund and Return Policy.</label>
          {message ? <p className={styles.error} role="alert">{message}</p> : null}
          <button className={styles.placeOrder} type="submit" disabled={isSubmitting || !item?.productId || !hasPaymentMethods || !shippingMethod}>{isSubmitting ? "Placing order..." : "Place Order"}</button>
        </div>
      </div>
    </form>
  );
}

function extractOrderKey(url?: string) {
  if (!url) return "";

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.searchParams.get("key") || "";
  } catch {
    return "";
  }
}

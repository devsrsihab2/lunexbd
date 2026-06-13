"use client";

import { useMemo, useState } from "react";
import { bangladeshDistricts, getDivisionByDistrict, getThanasByDistrict } from "@/data/bangladesh-locations";
import { placeOrder } from "@/services/api/checkout.api";
import type { CheckoutLineItem, CheckoutOptions } from "@/types/checkout.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CheckoutForm.module.scss";

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
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const hasPaymentMethods = paymentMethods.length > 0;
  const hasShippingMethods = shippingMethods.length > 0;
  const paymentMethod = paymentMethods.some((method) => method.id === paymentMethodChoice)
    ? paymentMethodChoice
    : paymentMethods[0]?.id || "";
  const selectedDivision = getDivisionByDistrict(selectedDistrict);
  const thanaOptions = useMemo(() => getThanasByDistrict(selectedDistrict), [selectedDistrict]);
  const filteredDistricts = useMemo(() => {
    const query = districtSearch.trim().toLowerCase();

    if (!query) return bangladeshDistricts;

    return bangladeshDistricts.filter((district) => district.name.toLowerCase().includes(query));
  }, [districtSearch]);
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
    if (!selectedDistrict) {
      setMessage("Please select your district.");
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
        city: selectedDistrict,
        state: selectedDivision,
        postcode: selectedThana,
        country: "BD",
      },
      shipping: {
        firstName,
        lastName,
        phone: formData.get("phone"),
        address1: formData.get("address1"),
        city: selectedDistrict,
        state: selectedDivision,
        postcode: selectedThana,
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
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <b aria-live="polite">{quantity}</b>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}>
                    +
                  </button>
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
              <div
                className={styles.searchSelect}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget;

                  if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
                    setIsDistrictOpen(false);
                    setDistrictSearch("");
                  }
                }}
              >
                <input type="hidden" name="district" value={selectedDistrict} />
                <button
                  type="button"
                  className={styles.searchButton}
                  aria-haspopup="listbox"
                  aria-expanded={isDistrictOpen}
                  onClick={() => setIsDistrictOpen((open) => !open)}
                >
                  <span>{selectedDistrict || "Select District"}</span>
                  <span aria-hidden="true">v</span>
                </button>
                {isDistrictOpen ? (
                  <div className={styles.searchMenu}>
                    <label className={styles.searchInputWrap}>
                      <span className="sr-only">Search district</span>
                      <input
                        autoFocus
                        type="search"
                        value={districtSearch}
                        onChange={(event) => setDistrictSearch(event.target.value)}
                      />
                    </label>
                    <div className={styles.searchOptions} role="listbox">
                      {filteredDistricts.length ? filteredDistricts.map((district) => (
                        <button
                          key={district.name}
                          type="button"
                          className={district.name === selectedDistrict ? styles.activeOption : undefined}
                          role="option"
                          aria-selected={district.name === selectedDistrict}
                          onClick={() => {
                            setSelectedDistrict(district.name);
                            setSelectedThana("");
                            setDistrictSearch("");
                            setIsDistrictOpen(false);
                          }}
                        >
                          {district.name}
                        </button>
                      )) : <p>No district found</p>}
                    </div>
                  </div>
                ) : null}
              </div>
              <select name="area" value={selectedThana} onChange={(event) => setSelectedThana(event.target.value)} disabled={!selectedDistrict}>
                <option value="">{selectedDistrict ? "Select Thana (Optional)" : "Select district first"}</option>
                {thanaOptions.map((thana) => (
                  <option key={thana} value={thana}>{thana}</option>
                ))}
              </select>
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
              <p className={styles.helpText}>Select a district to see the delivery method.</p>
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

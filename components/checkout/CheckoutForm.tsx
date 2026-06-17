"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bangladeshDistricts,
  getDivisionByDistrict,
  getThanasByDistrict,
} from "@/data/bangladesh-locations";
import { applyCheckoutCoupon, placeOrder } from "@/services/api/checkout.api";
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/services/api/cart.api";
import type { Cart, CartItem } from "@/types/cart.types";
import type {
  CheckoutCouponResult,
  CheckoutLineItem,
  CheckoutOptions,
} from "@/types/checkout.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CheckoutForm.module.scss";

const divisionAliases: Record<string, string[]> = {
  Chattogram: ["Chattogram", "Chittagong"],
  Barishal: ["Barishal", "Barisal"],
};

function normalizeLocation(value?: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function toNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return 0;

  const amount = Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function methodMatchesDivision(
  method: CheckoutOptions["shippingMethods"][number],
  division: string,
) {
  if (!division) return false;

  const targets = (divisionAliases[division] || [division]).map(
    normalizeLocation,
  );

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

  return sources.some((source) =>
    targets.some((target) => source.includes(target)),
  );
}

function getCheckoutImageSrc(image: CartItem["image"]) {
  if (!image) return undefined;

  if (typeof image === "string") {
    return image;
  }

  if ("src" in image && image.src) {
    return image.src;
  }

  if ("thumbnail" in image && image.thumbnail) {
    return image.thumbnail;
  }

  if ("url" in image && image.url) {
    return image.url;
  }

  if ("source_url" in image && image.source_url) {
    return image.source_url;
  }

  return undefined;
}

function cartItemToCheckoutItem(item: CartItem): CheckoutLineItem {
  return {
    key: item.key,
    productId: item.productId,
    variationId: item.variationId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
    image: getCheckoutImageSrc(item.image),
    attributes: item.attributes,
  };
}

function cartToCheckoutItems(cart?: Cart | null) {
  return (cart?.items || []).map(cartItemToCheckoutItem);
}

function getLineTotal(item: CheckoutLineItem) {
  return toNumber(item.price) * item.quantity;
}

function getOrderItems(items: CheckoutLineItem[]) {
  return items.map((item) => ({
    key: item.key,
    productId: item.productId,
    variationId: item.variationId,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    total: String(getLineTotal(item)),
    image: item.image,
    attributes: item.attributes,
  }));
}

export function CheckoutForm({
  options,
  initialItems = [],
  loadCart = false,
}: {
  options?: CheckoutOptions | null;
  initialItems?: CheckoutLineItem[];
  loadCart?: boolean;
}) {
  const [items, setItems] = useState<CheckoutLineItem[]>(initialItems);
  const [updatingKey, setUpdatingKey] = useState("");
  const [isLoadingCart, setIsLoadingCart] = useState(loadCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<CheckoutCouponResult | null>(null);

  const paymentMethods = useMemo(
    () => (options?.paymentMethods || []).filter((method) => method.enabled),
    [options?.paymentMethods],
  );

  const shippingMethods = useMemo(
    () => options?.shippingMethods || [],
    [options?.shippingMethods],
  );

  const [paymentMethodChoice, setPaymentMethodChoice] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const hasItems = items.length > 0;
  const hasPaymentMethods = paymentMethods.length > 0;
  const hasShippingMethods = shippingMethods.length > 0;

  const paymentMethod = paymentMethods.some(
    (method) => method.id === paymentMethodChoice,
  )
    ? paymentMethodChoice
    : paymentMethods[0]?.id || "";

  const selectedDivision = getDivisionByDistrict(selectedDistrict);

  const thanaOptions = useMemo(
    () => getThanasByDistrict(selectedDistrict),
    [selectedDistrict],
  );

  const filteredDistricts = useMemo(() => {
    const query = districtSearch.trim().toLowerCase();

    if (!query) return bangladeshDistricts;

    return bangladeshDistricts.filter((district) =>
      district.name.toLowerCase().includes(query),
    );
  }, [districtSearch]);

  const selectedShipping = useMemo(() => {
    if (!selectedDivision) return null;

    return (
      shippingMethods.find((method) =>
        methodMatchesDivision(method, selectedDivision),
      ) || null
    );
  }, [selectedDivision, shippingMethods]);

  const shippingMethod = selectedShipping?.id || "";
  const subtotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const shippingCost = Number(selectedShipping?.cost || 0);
  const discount = Math.min(subtotal, toNumber(appliedCoupon?.discount));
  const total = Math.max(0, subtotal - discount) + shippingCost;

  useEffect(() => {
    if (!loadCart) return;

    let active = true;

    setIsLoadingCart(true);

    getCart()
      .then((response) => {
        if (!active) return;

        if (response.success) {
          setItems(cartToCheckoutItems(response.data));
          setMessage("");
        } else {
          setMessage(response.message || "Could not load cart items.");
        }
      })
      .finally(() => {
        if (active) setIsLoadingCart(false);
      });

    return () => {
      active = false;
    };
  }, [loadCart]);

  function resetCouponAfterCartChange() {
    if (!appliedCoupon) return;

    setAppliedCoupon(null);
    setCouponMessage(
      "Coupon removed because cart items changed. Apply it again.",
    );
  }

  async function updateItemQuantity(item: CheckoutLineItem, quantity: number) {
    const nextQuantity = Math.max(0, quantity);

    setMessage("");
    resetCouponAfterCartChange();

    if (!item.key) {
      setItems((current) =>
        nextQuantity === 0
          ? current.filter(
              (currentItem) =>
                !(
                  currentItem.productId === item.productId &&
                  currentItem.variationId === item.variationId
                ),
            )
          : current.map((currentItem) =>
              currentItem.productId === item.productId &&
              currentItem.variationId === item.variationId
                ? { ...currentItem, quantity: nextQuantity }
                : currentItem,
            ),
      );

      return;
    }

    setUpdatingKey(item.key);

    const response =
      nextQuantity === 0
        ? await removeCartItem(item.key)
        : await updateCartItem(item.key, nextQuantity);

    setUpdatingKey("");

    if (response.success) {
      setItems(cartToCheckoutItems(response.data));
      return;
    }

    setMessage(response.message || "Cart update failed.");
  }

  async function handleApplyCoupon() {
    const code = couponCode.trim();

    setCouponMessage("");

    if (!code) {
      setCouponMessage("Enter a coupon code.");
      return;
    }

    if (!hasItems) {
      setCouponMessage("Add products before applying a coupon.");
      return;
    }

    setIsApplyingCoupon(true);

    const response = await applyCheckoutCoupon({
      coupon: code,
      items: getOrderItems(items),
      shippingCost: String(shippingCost),
    });

    setIsApplyingCoupon(false);

    if (response.success) {
      setAppliedCoupon(response.data);
      setCouponCode(response.data.coupon);
      setCouponMessage(response.data.message || "Coupon applied successfully.");
      return;
    }

    setAppliedCoupon(null);
    setCouponMessage(response.message || "Coupon could not be applied.");
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasItems) {
      setMessage("Your cart is empty.");
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
    const [firstNameRaw, ...restName] = fullName.split(" ");
    const firstName = firstNameRaw || "Customer";
    const lastName = restName.join(" ") || firstName;

    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address1 = String(formData.get("address1") || "").trim();
    const orderItems = getOrderItems(items);

    const response = await placeOrder({
      item: orderItems[0],
      items: orderItems,
      paymentMethod,
      shippingMethod,
      coupon: appliedCoupon?.coupon || "",
      notes: formData.get("notes"),
      billing: {
        firstName,
        lastName,
        email,
        phone,
        address1,
        city: selectedDistrict,
        state: selectedDivision,
        postcode: selectedThana,
        country: "BD",
      },
      shipping: {
        firstName,
        lastName,
        phone,
        address1,
        city: selectedDistrict,
        state: selectedDivision,
        postcode: selectedThana,
        country: "BD",
      },
    });

    setIsSubmitting(false);

    if (response.success) {
      if (response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl;
        return;
      }

      const orderKey =
        response.data.orderKey || extractOrderKey(response.data.redirectUrl);

      const params = new URLSearchParams({
        orderId: String(response.data.order.id),
      });

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

            {isLoadingCart ? (
              <p className={styles.helpText}>Loading cart items...</p>
            ) : null}

            {!isLoadingCart && !items.length ? (
              <p className={styles.emptyMethod}>Your cart is empty.</p>
            ) : null}

            {items.map((item) => {
              const lineTotal = getLineTotal(item);
              const isUpdating = item.key ? updatingKey === item.key : false;

              return (
                <div
                  className={styles.reviewItem}
                  key={`${item.key || item.productId}-${item.variationId || 0}`}
                >
                  <div className={styles.thumb}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span aria-hidden="true">{item.name.slice(0, 1)}</span>
                    )}
                  </div>

                  <div>
                    <strong>{item.name}</strong>

                    {item.attributes ? (
                      <p className={styles.helpText}>
                        {Object.entries(item.attributes)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    ) : null}

                    <div className={styles.qtyRow}>
                      <span>Qty.</span>

                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={isUpdating || item.quantity <= 1}
                        onClick={() =>
                          updateItemQuantity(item, item.quantity - 1)
                        }
                      >
                        -
                      </button>

                      <b aria-live="polite">{item.quantity}</b>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={isUpdating}
                        onClick={() =>
                          updateItemQuantity(item, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <strong>{formatPrice(lineTotal)}</strong>

                  <button
                    type="button"
                    className={styles.removeItem}
                    disabled={isUpdating}
                    aria-label={`Remove ${item.name}`}
                    onClick={() => updateItemQuantity(item, 0)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              );
            })}
          </section>

          <section className={styles.panel}>
            <h2>Shipping Address</h2>

            <div className={styles.fields}>
              <input name="fullName" placeholder="Your Full Name *" required />
              <input name="phone" placeholder="017********" required />
              <input name="email" type="email" placeholder="Email address" />

              <input
                name="address1"
                placeholder="ex: House no. / building / street / area"
                required
              />

              <div
                className={styles.searchSelect}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget;

                  if (
                    !(nextTarget instanceof Node) ||
                    !event.currentTarget.contains(nextTarget)
                  ) {
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
                        onChange={(event) =>
                          setDistrictSearch(event.target.value)
                        }
                      />
                    </label>

                    <div className={styles.searchOptions} role="listbox">
                      {filteredDistricts.length ? (
                        filteredDistricts.map((district) => (
                          <button
                            key={district.name}
                            type="button"
                            className={
                              district.name === selectedDistrict
                                ? styles.activeOption
                                : undefined
                            }
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
                        ))
                      ) : (
                        <p>No district found</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <select
                name="area"
                value={selectedThana}
                onChange={(event) => setSelectedThana(event.target.value)}
                disabled={!selectedDistrict}
              >
                <option value="">
                  {selectedDistrict
                    ? "Select Thana (Optional)"
                    : "Select district first"}
                </option>

                {thanaOptions.map((thana) => (
                  <option key={thana} value={thana}>
                    {thana}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        <div className={styles.right}>
          <section className={styles.panel}>
            <h2>Payment method</h2>

            {hasPaymentMethods ? (
              <div className={styles.methodGrid}>
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`${styles.method} ${
                      paymentMethod === method.id ? styles.activeMethod : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethodChoice(method.id)}
                    />
                    <span>{method.title}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMethod}>No payment method available.</p>
            )}
          </section>

          {/* <section className={styles.panel}>
            <h2>Shipping method</h2>

            {!hasShippingMethods || (selectedDivision && !selectedShipping) ? (
              <p className={styles.emptyMethod}>
                No delivery method available.
              </p>
            ) : selectedShipping ? (
              <div className={styles.autoMethod}>
                <span>{selectedShipping.title}</span>
                <strong>{formatPrice(selectedShipping.cost)}</strong>
              </div>
            ) : (
              <p className={styles.helpText}>
                Select a district to see the delivery method.
              </p>
            )}
          </section> */}

          <section className={styles.panel}>
            <h2>Have any coupon or gift voucher?</h2>

            <div className={styles.couponBox}>
              <input
                className={styles.fullControl}
                value={couponCode}
                placeholder="Coupon code"
                disabled={!options?.couponsEnabled || isApplyingCoupon}
                onChange={(event) => {
                  setCouponCode(event.target.value);
                  setCouponMessage("");

                  if (appliedCoupon) {
                    setAppliedCoupon(null);
                  }
                }}
              />

              <button
                type="button"
                className={styles.applyCoupon}
                disabled={
                  !options?.couponsEnabled ||
                  isApplyingCoupon ||
                  !couponCode.trim() ||
                  !hasItems
                }
                onClick={handleApplyCoupon}
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>

            {appliedCoupon ? (
              <div className={styles.appliedCoupon}>
                <span>Applied: {appliedCoupon.coupon}</span>
                <button type="button" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            ) : null}

            {couponMessage ? (
              <p
                className={
                  appliedCoupon ? styles.couponSuccess : styles.couponError
                }
                role="status"
              >
                {couponMessage}
              </p>
            ) : null}
          </section>

          <section className={styles.totals}>
            <div>
              <span>Sub total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            {discount > 0 ? (
              <div>
                <span>Discount</span>
                <strong>-{formatPrice(discount)}</strong>
              </div>
            ) : null}

            {shippingCost > 0 ? (
              <div>
                <span>Delivery cost</span>
                <strong>{formatPrice(shippingCost)}</strong>
              </div>
            ) : null}

            <div>
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>
              Special notes <small>(Optional)</small>
            </h2>
            <textarea name="notes" maxLength={90} />
            <small>0 / 90 characters</small>
          </section>

          <label className={styles.terms}>
            <input type="checkbox" required defaultChecked /> I have read and
            agree to the Terms and Conditions, Privacy Policy & Refund and
            Return Policy.
          </label>

          {message ? (
            <p className={styles.error} role="alert">
              {message}
            </p>
          ) : null}

          <button
            className={styles.placeOrder}
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingCart ||
              !hasItems ||
              !hasPaymentMethods ||
              !shippingMethod
            }
          >
            {isSubmitting ? "Placing order..." : "Place Order"}
          </button>
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

function TrashIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 15h10l1-15" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

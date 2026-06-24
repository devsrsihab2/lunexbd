"use client";

import { useEffect, useMemo, useState } from "react";
import {
  bangladeshDistricts,
  getDivisionByDistrict,
  getThanasByDistrict,
} from "@/data/bangladesh-locations";
import { saveAddress } from "@/services/api/Addresses.api";
import type { SavedAddress } from "@/services/api/Addresses.api";
import { applyCheckoutCoupon, placeOrder } from "@/services/api/checkout.api";
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/services/api/cart.api";
import { getMe } from "@/services/api/auth.api";
import type { Cart, CartItem } from "@/types/cart.types";
import type {
  CheckoutCouponResult,
  CheckoutLineItem,
  CheckoutOptions,
} from "@/types/checkout.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./CheckoutForm.module.scss";

// ─── Helpers (unchanged from original) ───────────────────────────────────────

const divisionAliases: Record<string, string[]> = {
  Chattogram: ["Chattogram", "Chittagong"],
  Barishal: ["Barishal", "Barisal"],
};

function normalizeLocation(value?: string) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function toNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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
  const isOutsideDhaka =
    zoneName.includes("outsidedhaka") ||
    zoneName.includes("outsideofdhaka") ||
    zoneName.includes("exceptdhaka") ||
    zoneName.includes("nondhaka");
  if (isOutsideDhaka) return division !== "Dhaka";
  return sources.some((s) => targets.some((t) => s.includes(t)));
}

function getCheckoutImageSrc(image: CartItem["image"]) {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if ("src" in image && image.src) return image.src;
  if ("thumbnail" in image && image.thumbnail) return image.thumbnail;
  if ("url" in image && image.url) return image.url;
  if ("source_url" in image && image.source_url) return image.source_url;
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

function extractOrderKey(url?: string) {
  if (!url) return "";
  try {
    const p = new URL(url, window.location.origin);
    return p.searchParams.get("key") || "";
  } catch {
    return "";
  }
}

// ─── Saved-address picker ─────────────────────────────────────────────────────

function SavedAddressPicker({
  addresses,
  onSelect,
}: {
  addresses: SavedAddress[];
  onSelect: (addr: SavedAddress) => void;
}) {
  if (!addresses.length) return null;
  return (
    <div className={styles.savedAddresses}>
      <p className={styles.savedAddressLabel}>Saved addresses</p>
      <div className={styles.savedAddressCards}>
        {addresses.map((addr) => (
          <label key={addr.type} className={styles.savedAddressCard}>
            <input
              type="radio"
              name="_savedAddressPick"
              onChange={() => onSelect(addr)}
            />
            <span>
              <strong>{addr.label}</strong>
              <small>
                {addr.addressLine}, {addr.district}
                {addr.thana ? `, ${addr.thana}` : ""}
              </small>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Save-address checkbox (shown after entering an address) ──────────────────

function SaveAddressCheckbox({
  existingTypes,
}: {
  existingTypes: Array<"home" | "office">;
}) {
  const canHome = !existingTypes.includes("home");
  const canOffice = !existingTypes.includes("office");

  if (!canHome && !canOffice) return null; // both already saved

  return (
    <div className={styles.saveAddressRow}>
      <label className={styles.saveAddressCheck}>
        <input type="checkbox" name="_saveAddress" value="1" />
        <span>Save this address to my account</span>
      </label>
      {canHome && canOffice ? (
        <select
          name="_saveAddressType"
          defaultValue="home"
          className={styles.saveAddressType}
        >
          <option value="home">as Home Address</option>
          <option value="office">as Office Address</option>
        </select>
      ) : (
        <input
          type="hidden"
          name="_saveAddressType"
          value={canHome ? "home" : "office"}
        />
      )}
      {canHome && !canOffice ? (
        <small className={styles.saveAddressHint}>
          Will be saved as Home Address
        </small>
      ) : null}
      {canOffice && !canHome ? (
        <small className={styles.saveAddressHint}>
          Will be saved as Office Address (Home already saved)
        </small>
      ) : null}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
  const [isLoadingCart, setLoadingCart] = useState(loadCart);
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<CheckoutCouponResult | null>(null);

  // Saved addresses from the logged-in user
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const existingAddressTypes = savedAddresses.map(
    (a) => a.type as "home" | "office",
  );

  const paymentMethods = useMemo(
    () => (options?.paymentMethods || []).filter((m) => m.enabled),
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
  const [isDistrictOpen, setDistrictOpen] = useState(false);

  // Pre-filled from saved address selection
  const [prefillName, setPrefillName] = useState("");
  const [prefillAddress, setPrefillAddress] = useState("");

  const hasItems = items.length > 0;
  const hasPaymentMethods = paymentMethods.length > 0;
  const hasShippingMethods = shippingMethods.length > 0;

  const paymentMethod = paymentMethods.some((m) => m.id === paymentMethodChoice)
    ? paymentMethodChoice
    : paymentMethods[0]?.id || "";

  const selectedDivision = getDivisionByDistrict(selectedDistrict);
  const thanaOptions = useMemo(
    () => getThanasByDistrict(selectedDistrict),
    [selectedDistrict],
  );

  const filteredDistricts = useMemo(() => {
    const q = districtSearch.trim().toLowerCase();
    if (!q) return bangladeshDistricts;
    return bangladeshDistricts.filter((d) => d.name.toLowerCase().includes(q));
  }, [districtSearch]);

  const selectedShipping = useMemo(() => {
    if (!selectedDivision) return null;
    return (
      shippingMethods.find((m) => methodMatchesDivision(m, selectedDivision)) ||
      null
    );
  }, [selectedDivision, shippingMethods]);

  const shippingMethod = selectedShipping?.id || "";
  const subtotal = items.reduce((s, i) => s + getLineTotal(i), 0);
  const shippingCost = Number(selectedShipping?.cost || 0);
  const discount = Math.min(subtotal, toNumber(appliedCoupon?.discount));
  const total = Math.max(0, subtotal - discount) + shippingCost;

  // Load cart + current user (for saved addresses)
  useEffect(() => {
    if (loadCart) {
      setLoadingCart(true);
      getCart()
        .then((res) => {
          if (res.success) {
            setItems(cartToCheckoutItems(res.data));
            setMessage("");
          } else setMessage(res.message || "Could not load cart items.");
        })
        .finally(() => setLoadingCart(false));
    }

    // Load saved addresses if user is logged in
    getMe().then((res) => {
      if (res.success && res.data.addresses?.length) {
        setSavedAddresses(res.data.addresses);
      }
    });
  }, [loadCart]);

  // Apply a saved address to the form
  function applySavedAddress(addr: SavedAddress) {
    setPrefillAddress(addr.addressLine);
    setSelectedDistrict(addr.district);
    setSelectedThana(addr.thana || "");
  }

  function resetCouponAfterCartChange() {
    if (!appliedCoupon) return;
    setAppliedCoupon(null);
    setCouponMessage(
      "Coupon removed because cart items changed. Apply it again.",
    );
  }

  async function updateItemQuantity(item: CheckoutLineItem, quantity: number) {
    const nextQty = Math.max(0, quantity);
    setMessage("");
    resetCouponAfterCartChange();

    if (!item.key) {
      setItems((cur) =>
        nextQty === 0
          ? cur.filter(
              (c) =>
                !(
                  c.productId === item.productId &&
                  c.variationId === item.variationId
                ),
            )
          : cur.map((c) =>
              c.productId === item.productId &&
              c.variationId === item.variationId
                ? { ...c, quantity: nextQty }
                : c,
            ),
      );
      return;
    }

    setUpdatingKey(item.key);
    const res =
      nextQty === 0
        ? await removeCartItem(item.key)
        : await updateCartItem(item.key, nextQty);
    setUpdatingKey("");
    if (res.success) {
      setItems(cartToCheckoutItems(res.data));
      return;
    }
    setMessage(res.message || "Cart update failed.");
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
    setApplyingCoupon(true);
    const res = await applyCheckoutCoupon({
      coupon: code,
      items: getOrderItems(items),
      shippingCost: String(shippingCost),
    });
    setApplyingCoupon(false);
    if (res.success) {
      setAppliedCoupon(res.data);
      setCouponCode(res.data.coupon);
      setCouponMessage(res.data.message || "Coupon applied successfully.");
    } else {
      setAppliedCoupon(null);
      setCouponMessage(res.message || "Coupon could not be applied.");
    }
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
      setMessage("No delivery method available for your area.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const fd = new FormData(event.currentTarget);
    const fullName = String(fd.get("fullName") || "").trim();
    const [fnRaw, ...rest] = fullName.split(" ");
    const firstName = fnRaw || "Customer";
    const lastName = rest.join(" ") || firstName;
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const address1 = String(fd.get("address1") || "").trim();
    const orderItems = getOrderItems(items);

    const billing = {
      firstName,
      lastName,
      email,
      phone,
      address1,
      city: selectedDistrict,
      state: selectedDivision,
      postcode: selectedThana,
      country: "BD",
    };

    const response = await placeOrder({
      item: orderItems[0],
      items: orderItems,
      paymentMethod,
      shippingMethod,
      coupon: appliedCoupon?.coupon || "",
      notes: fd.get("notes"),
      billing,
      shipping: { ...billing, email: "" },
    });

    // If user opted to save address, persist it (fire-and-forget)
    const wantSave = fd.get("_saveAddress") === "1";
    const saveType = (fd.get("_saveAddressType") || "home") as
      | "home"
      | "office";
    if (wantSave && address1 && selectedDistrict) {
      saveAddress({
        type: saveType,
        addressLine: address1,
        district: selectedDistrict,
        thana: selectedThana,
        postalCode: "",
        country: "BD",
      }).catch(() => {}); // non-blocking
    }

    setSubmitting(false);

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
      if (orderKey) params.set("orderKey", orderKey);
      window.location.href = `/order-confirmation?${params.toString()}`;
      return;
    }

    setMessage(response.message || "Order could not be placed.");
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <form className={styles.checkout} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        {/* ── LEFT ───────────────────────────────────────────── */}
        <div className={styles.left}>
          {/* Order review */}
          <section className={styles.panel}>
            <h2>Order review</h2>
            {isLoadingCart ? (
              <p className={styles.helpText}>Loading cart items…</p>
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
                          .map(([k, v]) => `${k}: ${v}`)
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

          {/* Shipping address */}
          <section className={styles.panel}>
            <h2>Shipping Address</h2>

            {/* Show saved address picker if user has any */}
            <SavedAddressPicker
              addresses={savedAddresses}
              onSelect={applySavedAddress}
            />

            <div className={styles.fields}>
              <input
                name="fullName"
                placeholder="Your Full Name *"
                required
                value={prefillName}
                onChange={(e) => setPrefillName(e.target.value)}
              />
              <input name="phone" placeholder="017********" required />
              <input name="email" type="email" placeholder="Email address" />

              <input
                name="address1"
                placeholder="ex: House no. / building / street / area"
                required
                value={prefillAddress}
                onChange={(e) => setPrefillAddress(e.target.value)}
              />

              {/* District picker */}
              <div
                className={styles.searchSelect}
                onBlur={(e) => {
                  const next = e.relatedTarget;
                  if (
                    !(next instanceof Node) ||
                    !e.currentTarget.contains(next)
                  ) {
                    setDistrictOpen(false);
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
                  onClick={() => setDistrictOpen((o) => !o)}
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
                        onChange={(e) => setDistrictSearch(e.target.value)}
                      />
                    </label>
                    <div className={styles.searchOptions} role="listbox">
                      {filteredDistricts.length ? (
                        filteredDistricts.map((d) => (
                          <button
                            key={d.name}
                            type="button"
                            className={
                              d.name === selectedDistrict
                                ? styles.activeOption
                                : undefined
                            }
                            role="option"
                            aria-selected={d.name === selectedDistrict}
                            onClick={() => {
                              setSelectedDistrict(d.name);
                              setSelectedThana("");
                              setDistrictSearch("");
                              setDistrictOpen(false);
                            }}
                          >
                            {d.name}
                          </button>
                        ))
                      ) : (
                        <p>No district found</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Thana */}
              <select
                name="area"
                value={selectedThana}
                onChange={(e) => setSelectedThana(e.target.value)}
                disabled={!selectedDistrict}
              >
                <option value="">
                  {selectedDistrict
                    ? "Select Thana (Optional)"
                    : "Select district first"}
                </option>
                {thanaOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Save address option — only shown when not pre-filling from a saved address */}
            <SaveAddressCheckbox existingTypes={existingAddressTypes} />
          </section>
        </div>

        {/* ── RIGHT ──────────────────────────────────────────── */}
        <div className={styles.right}>
          {/* Payment method */}
          <section className={styles.panel}>
            <h2>Payment method</h2>
            {hasPaymentMethods ? (
              <div className={styles.methodGrid}>
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`${styles.method} ${paymentMethod === method.id ? styles.activeMethod : ""}`}
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

          {/* Coupon */}
          <section className={styles.panel}>
            <h2>Have any coupon or gift voucher?</h2>
            <div className={styles.couponBox}>
              <input
                className={styles.fullControl}
                value={couponCode}
                placeholder="Coupon code"
                disabled={!options?.couponsEnabled || isApplyingCoupon}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponMessage("");
                  if (appliedCoupon) setAppliedCoupon(null);
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
                {isApplyingCoupon ? "Applying…" : "Apply"}
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

          {/* Totals */}
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

          {/* Notes */}
          <section className={styles.panel}>
            <h2>
              Special notes <small>(Optional)</small>
            </h2>
            <textarea name="notes" maxLength={90} />
            <small>0 / 90 characters</small>
          </section>

          {/* T&C */}
          <label className={styles.terms}>
            <input type="checkbox" required defaultChecked /> I have read and
            agree to the Terms and Conditions, Privacy Policy &amp; Refund and
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
            {isSubmitting ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </div>
    </form>
  );
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

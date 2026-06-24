"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { trackOrder } from "@/services/api/orders.api";
import type { ApiResponse } from "@/types/api.types";
import type { Order, OrderStatus } from "@/types/order.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./order-tracking.module.scss";

type SearchMode = "phone" | "tracking";

const STEP_ORDER: OrderStatus[] = ["pending", "processing", "completed"];

const STEP_LABELS: Record<string, string> = {
  pending: "Order placed",
  processing: "Processing",
  completed: "Delivered",
};

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  pending: {
    title: "Order received",
    description: "We've received your order and it's waiting to be confirmed.",
  },
  processing: {
    title: "Being prepared",
    description: "Your order is confirmed and is being packed for delivery.",
  },
  "on-hold": {
    title: "On hold",
    description:
      "Your order is on hold, usually while we confirm payment or stock.",
  },
  completed: {
    title: "Delivered",
    description: "Your order has been delivered. Enjoy!",
  },
  cancelled: {
    title: "Cancelled",
    description:
      "This order was cancelled. Contact support if this is unexpected.",
  },
  refunded: {
    title: "Refunded",
    description: "This order has been refunded.",
  },
  failed: {
    title: "Payment failed",
    description:
      "Payment for this order did not complete. Try placing it again.",
  },
};

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function isCancelledLike(status: string) {
  return status === "cancelled" || status === "refunded" || status === "failed";
}

function stepIndex(status: string) {
  const idx = STEP_ORDER.indexOf(status as OrderStatus);
  return idx === -1 ? 0 : idx;
}

/**
 * CartItem["image"] can be a plain URL string, a ProductImage object, or a
 * loosely-typed object with varying key names depending on where the data
 * originated (WooCommerce REST vs internal cart vs order item). Normalize
 * all of those into a single { src, alt } shape, or null if nothing usable.
 */
function normalizeItemImage(
  image: unknown,
  fallbackAlt: string,
): { src: string; alt: string } | null {
  if (!image) return null;

  if (typeof image === "string") {
    return image ? { src: image, alt: fallbackAlt } : null;
  }

  if (typeof image === "object") {
    const img = image as Record<string, unknown>;
    const src = img.src || img.url || img.source_url;
    const alt = img.alt || img.alt_text;

    if (typeof src === "string" && src) {
      return { src, alt: typeof alt === "string" && alt ? alt : fallbackAlt };
    }
  }

  return null;
}

export function OrderTrackingClient() {
  const [mode, setMode] = useState<SearchMode>("phone");
  const [result, setResult] = useState<ApiResponse<Order> | null>(null);
  const [loading, setLoading] = useState<"details" | "tracking" | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading("details");
    setHasSearched(true);
    const response = await trackOrder({
      orderId: String(form.get("orderId") || "") || undefined,
      phone: String(form.get("phone") || ""),
    });
    setLoading(null);
    setResult(response);
  }

  async function handleTrackingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading("tracking");
    setHasSearched(true);
    const response = await trackOrder({
      trackingNumber: String(form.get("trackingNumber") || ""),
    });
    setLoading(null);
    setResult(response);
  }

  const order = result?.success ? result.data : null;
  const statusInfo = order
    ? (STATUS_COPY[order.status] ?? STATUS_COPY.pending)
    : null;
  const cancelled = order ? isCancelledLike(order.status) : false;
  const currentStep = order ? stepIndex(order.status) : 0;
  const shipping = order?.shipping as
    | {
        firstName?: string;
        lastName?: string;
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        postcode?: string;
        phone?: string;
      }
    | undefined;

  return (
    <section className={styles.trackingShell}>
      <div className={styles.formsGrid}>
        <form className={styles.trackCard} onSubmit={handleDetailsSubmit}>
          <div>
            <p className={styles.kicker}>Option 1</p>
            <h2>Order ID &amp; phone number</h2>
          </div>
          {/* <label>
            <span>Order ID (optional)</span>
            <input
              name="orderId"
              inputMode="numeric"
              placeholder="e.g. 393"
              onFocus={() => setMode("phone")}
            />
          </label> */}
          <label>
            <span>Phone number</span>
            <input
              name="phone"
              type="tel"
              required
              placeholder="e.g. 01XXXXXXXXX"
              onFocus={() => setMode("phone")}
            />
          </label>
          <button type="submit" disabled={Boolean(loading)}>
            {loading === "details" ? "Tracking..." : "Track order"}
          </button>
        </form>

        <form className={styles.trackCard} onSubmit={handleTrackingSubmit}>
          <div>
            <p className={styles.kicker}>Option 2</p>
            <h2>Tracking number</h2>
          </div>
          <label>
            <span>Courier tracking number</span>
            <input
              name="trackingNumber"
              required
              placeholder="e.g. TRK-2026-00123"
              onFocus={() => setMode("tracking")}
            />
          </label>
          <p className={styles.hint}>
            Use this if you have a courier tracking number instead of your order
            ID.
          </p>
          <button type="submit" disabled={Boolean(loading)}>
            {loading === "tracking" ? "Tracking..." : "Track number"}
          </button>
        </form>
      </div>

      {hasSearched && loading ? (
        <div className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeletonLine} style={{ width: "40%" }} />
          <div className={styles.skeletonLine} style={{ width: "70%" }} />
          <div className={styles.skeletonLine} style={{ width: "55%" }} />
        </div>
      ) : null}

      {!loading && result && !result.success ? (
        <div className={styles.error} role="alert">
          <strong>We couldn&apos;t find that order.</strong>
          <p>
            {result.message ||
              "Double-check your order ID and phone number, or try the tracking number option."}
          </p>
        </div>
      ) : null}

      {!loading && order && statusInfo ? (
        <article className={styles.result}>
          <header className={styles.resultHeader}>
            <div>
              <p className={styles.kicker}>Order details</p>
              <h2>Order #{order.number}</h2>
              <p className={styles.subline}>
                Placed on {formatDate(order.dateCreated)}
                {order.itemsCount
                  ? ` · ${order.itemsCount} item${order.itemsCount > 1 ? "s" : ""}`
                  : ""}
                {" · "}
                {formatPrice(order.total)}
              </p>
            </div>
            <span
              className={`${styles.statusBadge} ${
                cancelled ? styles.statusBadgeDanger : styles.statusBadgeActive
              }`}
            >
              {order.statusLabel || statusInfo.title}
            </span>
          </header>

          <p className={styles.statusDescription}>{statusInfo.description}</p>

          {!cancelled ? (
            <ol className={styles.stepper}>
              {STEP_ORDER.map((step, index) => (
                <li
                  key={step}
                  className={`${styles.step} ${
                    index <= currentStep ? styles.stepDone : ""
                  } ${index === currentStep ? styles.stepCurrent : ""}`}
                >
                  <span className={styles.stepDot} aria-hidden="true" />
                  <span className={styles.stepLabel}>{STEP_LABELS[step]}</span>
                </li>
              ))}
            </ol>
          ) : null}

          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <p className={styles.infoLabel}>Delivery address</p>
              {shipping?.address1 ? (
                <address className={styles.infoText}>
                  {shipping.firstName} {shipping.lastName}
                  <br />
                  {shipping.address1}
                  {shipping.address2 ? `, ${shipping.address2}` : ""}
                  <br />
                  {[shipping.city, shipping.state, shipping.postcode]
                    .filter(Boolean)
                    .join(", ")}
                  {shipping.phone ? (
                    <>
                      <br />
                      {shipping.phone}
                    </>
                  ) : null}
                </address>
              ) : (
                <p className={styles.infoText}>Not available</p>
              )}
            </div>
            <div className={styles.infoBlock}>
              <p className={styles.infoLabel}>Payment method</p>
              <p className={styles.infoText}>
                {order.paymentMethodTitle || "—"}
              </p>
              {order.datePaid ? (
                <p className={styles.infoMuted}>
                  Paid {formatDateTime(order.datePaid)}
                </p>
              ) : null}
            </div>
            <div className={styles.infoBlock}>
              <p className={styles.infoLabel}>Order total</p>
              <p className={styles.infoText}>{formatPrice(order.total)}</p>
              {order.shippingTotal && Number(order.shippingTotal) > 0 ? (
                <p className={styles.infoMuted}>
                  Includes {formatPrice(order.shippingTotal)} delivery
                </p>
              ) : null}
            </div>
          </div>

          {order.items?.length ? (
            <div className={styles.itemsBlock}>
              <p className={styles.infoLabel}>Items in this order</p>
              <ul className={styles.itemsList}>
                {order.items.map((item) => {
                  const image = normalizeItemImage(item.image, item.name);
                  return (
                    <li key={item.key} className={styles.itemRow}>
                      {image ? (
                        <img
                          src={image.src}
                          alt={image.alt}
                          className={styles.itemImage}
                          width={56}
                          height={56}
                        />
                      ) : (
                        <div
                          className={styles.itemImagePlaceholder}
                          aria-hidden="true"
                        />
                      )}
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>Qty {item.quantity}</p>
                      </div>
                      <p className={styles.itemPrice}>
                        {formatPrice(item.total)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {order.customerNote ? (
            <p className={styles.note}>
              <strong>Note:</strong> {order.customerNote}
            </p>
          ) : null}

          <p className={styles.helpLine}>
            Need help with this order? <a href="/contact">Contact support</a>{" "}
            and have your order number ready.
          </p>
        </article>
      ) : null}
    </section>
  );
}

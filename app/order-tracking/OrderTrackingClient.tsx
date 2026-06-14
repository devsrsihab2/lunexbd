"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { trackOrder } from "@/services/api/orders.api";
import type { ApiResponse } from "@/types/api.types";
import type { Order } from "@/types/order.types";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./order-tracking.module.scss";

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

function statusLabel(status: Order["status"]) {
  return status.replace("-", " ");
}

export function OrderTrackingClient() {
  const [result, setResult] = useState<ApiResponse<Order> | null>(null);
  const [loading, setLoading] = useState<"details" | "tracking" | null>(null);

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading("details");
    const response = await trackOrder({
      orderId: String(form.get("orderId") || ""),
      phone: String(form.get("phone") || ""),
    });
    setLoading(null);
    setResult(response);
  }

  async function handleTrackingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading("tracking");
    const response = await trackOrder({
      trackingNumber: String(form.get("trackingNumber") || ""),
    });
    setLoading(null);
    setResult(response);
  }

  return (
    <section className={styles.trackingShell}>
      <div className={styles.formsGrid}>
        <form className={styles.trackCard} onSubmit={handleDetailsSubmit}>
          <div>
            <p className={styles.kicker}>Option 1</p>
            <h2>Order ID and phone</h2>
          </div>
          <label>
            <span>Order ID</span>
            <input name="orderId" inputMode="numeric" required />
          </label>
          <label>
            <span>Phone number</span>
            <input name="phone" type="tel" required />
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
            <span>Order tracking number</span>
            <input name="trackingNumber" required />
          </label>
          <button type="submit" disabled={Boolean(loading)}>
            {loading === "tracking" ? "Tracking..." : "Track number"}
          </button>
        </form>
      </div>

      {result ? (
        result.success ? (
          <article className={styles.result}>
            <div>
              <p className={styles.kicker}>Current order status</p>
              <h2>Order #{result.data.number}</h2>
              <p>
                Placed on {formatDate(result.data.dateCreated)}. Total{" "}
                {formatPrice(result.data.total)}.
              </p>
            </div>
            <span>{statusLabel(result.data.status)}</span>
          </article>
        ) : (
          <p className={styles.error} role="alert">
            {result.message || "Could not track this order."}
          </p>
        )
      ) : null}
    </section>
  );
}

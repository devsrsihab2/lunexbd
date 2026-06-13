import type { Metadata } from "next";
import Link from "next/link";
import { trackOrder } from "@/services/api/orders.api";
import type { Order } from "@/types/order.types";
import { getCartItemImage } from "@/utils/cartImage";
import { formatPrice } from "@/utils/formatPrice";
import { createMetadata } from "@/utils/seo";
import styles from "./order-confirmation.module.scss";

export const metadata: Metadata = createMetadata({
  title: "Order Confirmation",
  path: "/order-confirmation",
  robots: "noindex,nofollow",
});

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const orderId = query.orderId || query.order_id || "";
  const orderKey = query.orderKey || query.order_key || "";
  const response =
    orderId && orderKey
      ? await trackOrder({ orderId, orderKey })
      : null;
  const order = response?.success ? response.data : null;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.check} aria-hidden="true">
          <CheckIcon />
        </div>
        <span>Order confirmed</span>
        <h1>Thank you for shopping with Lunex.</h1>
        <p>
          {order
            ? `Your order #${order.number || order.id} is now ${order.status.replace("-", " ")}.`
            : "Your order was received. Add the order key to this page URL to view the secure order summary."}
        </p>
      </section>

      <div className={styles.inner}>
        {order ? (
          <OrderReceipt order={order} />
        ) : (
          <section className={styles.notice}>
            <h2>Order details unavailable</h2>
            <p>
              For guest checkout, order details are protected by the WooCommerce order key.
              New orders will include it automatically after checkout.
            </p>
            {response && !response.success ? <strong>{response.message}</strong> : null}
          </section>
        )}

        <div className={styles.actions}>
          <Link href="/products">Continue shopping</Link>
          <Link href="/order-tracking">Track another order</Link>
        </div>
      </div>
    </main>
  );
}

function OrderReceipt({ order }: { order: Order }) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
  const placedAt = order.dateCreated
    ? new Intl.DateTimeFormat("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(order.dateCreated))
    : "Just now";

  return (
    <div className={styles.receipt}>
      <section className={styles.summary}>
        <InfoCard label="Order number" value={`#${order.number || order.id}`} />
        <InfoCard label="Placed on" value={placedAt} />
        <InfoCard label="Payment" value={order.paymentMethodTitle || "Cash on Delivery"} />
        <InfoCard label="Total" value={formatPrice(order.total)} strong />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            <h2>Order items</h2>
          </div>
          <strong>{formatPrice(order.total)}</strong>
        </div>

        <div className={styles.items}>
          {order.items.map((item) => {
            const image = getCartItemImage(item);

            return (
              <article key={item.key} className={styles.item}>
                <div className={styles.imageBox}>
                  {image ? (
                    <img src={image.src} alt={image.alt || item.name} loading="lazy" decoding="async" />
                  ) : (
                    <span aria-hidden="true">{item.name.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <h3>{item.name}</h3>
                  {item.attributes ? <p>{Object.entries(item.attributes).map(([key, value]) => `${key}: ${value}`).join(", ")}</p> : null}
                  <small>Qty {item.quantity} x {formatPrice(item.price)}</small>
                </div>
                <strong>{formatPrice(item.total)}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.nextSteps}>
        <h2>What happens next?</h2>
        <ol>
          <li><span />We review your order and confirm product availability.</li>
          <li><span />Our team prepares your Lunex item for delivery.</li>
          <li><span />You can track status anytime from the order tracking page.</li>
        </ol>
      </section>
    </div>
  );
}

function InfoCard({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? `${styles.infoCard} ${styles.strongCard}` : styles.infoCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

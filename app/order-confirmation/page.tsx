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
  const paymentStatus = query.paymentStatus || "";
  const isPaymentSuccess = paymentStatus === "success";
  const isPaymentIssue = [
    "failed",
    "failure",
    "cancel",
    "cancelled",
    "retry",
  ].includes(paymentStatus);
  const response =
    orderId && orderKey
      ? await trackOrder({ orderId, orderKey })
      : null;
  const order = response?.success ? response.data : null;
  const heroEyebrow = isPaymentSuccess
    ? "bKash payment successful"
    : isPaymentIssue
      ? "Payment needs attention"
      : "Order confirmed";
  const heroTitle = isPaymentSuccess
    ? "Your payment is complete."
    : isPaymentIssue
      ? "We could not complete the payment."
      : "Thank you for shopping with Lunex.";
  const heroMessage =
    isPaymentSuccess && order
      ? `We received your bKash payment for order #${order.number || order.id}. Your Lunex order is now ${order.status.replace("-", " ")}.`
      : isPaymentIssue && order
        ? `Order #${order.number || order.id} is saved, but the bKash payment was not completed. You can contact us or place the order again.`
        : order
          ? `Your order #${order.number || order.id} is now ${order.status.replace("-", " ")}.`
          : "Your order was received. Add the order key to this page URL to view the secure order summary.";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={isPaymentIssue ? `${styles.check} ${styles.warning}` : styles.check} aria-hidden="true">
          <CheckIcon />
        </div>
        <span>{heroEyebrow}</span>
        <h1>{heroTitle}</h1>
        <p>{heroMessage}</p>
      </section>

      <div className={styles.inner}>
        {paymentStatus ? (
          <PaymentBanner status={paymentStatus} order={order} />
        ) : null}

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

function PaymentBanner({ status, order }: { status: string; order: Order | null }) {
  const success = status === "success";
  const title = success ? "bKash payment received" : "bKash payment not completed";
  const message = success
    ? "Your transaction has been verified and attached to this WooCommerce order."
    : "Your order details are available below. Payment can be retried or handled by support.";

  return (
    <section className={success ? `${styles.paymentBanner} ${styles.paid}` : `${styles.paymentBanner} ${styles.unpaid}`}>
      <div>
        <span>{success ? "Paid" : "Action needed"}</span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      <dl>
        <div>
          <dt>Order</dt>
          <dd>{order ? `#${order.number || order.id}` : "Pending"}</dd>
        </div>
        <div>
          <dt>Payment method</dt>
          <dd>{order?.paymentMethodTitle || "bKash"}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{order ? formatPrice(order.total) : "-"}</dd>
        </div>
      </dl>
    </section>
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

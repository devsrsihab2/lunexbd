import { PageBanner } from "@/components/common/PageBanner";
import { OrderTrackingClient } from "./OrderTrackingClient";
import styles from "./order-tracking.module.scss";

export default function OrderTrackingPage() {
  return (
    <main className={styles.page}>
      <PageBanner
        eyebrow="Order Tracking"
        title="Track an order"
        text="Use your order ID and phone number, or enter only the tracking number to see the latest status."
        image="/lunex/tracking-order.jpg"
      />
      <OrderTrackingClient />
    </main>
  );
}

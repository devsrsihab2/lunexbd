import { PageBanner } from "@/components/common/PageBanner";
import { RouteSkeleton } from "@/components/ui/RouteSkeleton";
import styles from "./order-tracking.module.scss";

export default function Loading() {
  return (
    <main className={styles.page}>
      <PageBanner
        eyebrow="Order Tracking"
        title="Track an order"
        text="Loading tracking tools..."
        image="/lunex/travel-bag.png"
      />
      <RouteSkeleton />
    </main>
  );
}

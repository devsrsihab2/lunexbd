import { RouteSkeleton } from "@/components/ui/RouteSkeleton";
import styles from "./checkout.module.scss";

export default function Loading() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Checkout</h1>
        <p>Home &gt; Checkout</p>
      </header>
      <div className={styles.inner}>
        <RouteSkeleton />
      </div>
    </main>
  );
}

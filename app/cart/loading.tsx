import { RouteSkeleton } from "@/components/ui/RouteSkeleton";
import styles from "./cart.module.scss";

export default function Loading() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <RouteSkeleton />
      </div>
    </main>
  );
}

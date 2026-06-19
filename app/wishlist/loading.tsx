import { RouteSkeleton } from "@/components/ui/RouteSkeleton";
import styles from "./wishlist.module.scss";

export default function Loading() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p>Wishlist</p>
        <h1>Loading wishlist</h1>
        <span>Fetching your saved products...</span>
      </section>
      <RouteSkeleton />
    </main>
  );
}

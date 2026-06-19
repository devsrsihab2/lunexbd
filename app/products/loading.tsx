import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import styles from "./products.module.scss";

export default function Loading() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Lunex collection</span>
          <h1>Shop premium bags for every day</h1>
          <p>Loading products and filters...</p>
        </div>
      </section>

      <div className={styles.inner}>
        <ProductGridSkeleton count={8} variant="listing" />
      </div>
    </div>
  );
}

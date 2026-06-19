import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import styles from "../../products/products.module.scss";

export default function Loading() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Category</span>
          <h1>Loading category</h1>
          <p>Loading products and filters...</p>
        </div>
      </section>

      <div className={styles.inner}>
        <ProductGridSkeleton count={8} variant="listing" />
      </div>
    </div>
  );
}

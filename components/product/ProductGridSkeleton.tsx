import styles from "./ProductGridSkeleton.module.scss";

type ProductGridSkeletonProps = {
  count?: number;
  variant?: "default" | "listing";
};

export function ProductGridSkeleton({
  count = 8,
  variant = "default",
}: ProductGridSkeletonProps) {
  return (
    <div
      className={`${styles.grid} ${variant === "listing" ? styles.listing : ""}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <article className={styles.card} key={index}>
          <div className={styles.media} />
          <div className={styles.body}>
            <span className={`${styles.line} ${styles.title}`} />
            <span className={`${styles.line} ${styles.price}`} />
            <span className={`${styles.line} ${styles.stock}`} />
          </div>
          <div className={styles.actions}>
            <span className={styles.button} />
            <span className={styles.button} />
          </div>
        </article>
      ))}
    </div>
  );
}

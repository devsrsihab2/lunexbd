import styles from "./Feedback.module.scss";

type SkeletonProps = {
  lines?: number;
  variant?: "default" | "page";
};

export function Skeleton({ lines = 3, variant = "default" }: SkeletonProps) {
  if (variant === "page") {
    return (
      <section className={styles.pageSkeleton} aria-hidden="true">
        <div className={styles.loadingHeader}>
          <span className={styles.logoSkeleton} />
          <div className={styles.headerActions}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.loadingInner}>
          <div className={styles.heroSkeleton}>
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className={styles.contentSkeleton}>
            <aside className={styles.filterSkeleton}>
              <span />
              <span />
              <span />
              <span />
              <span />
            </aside>

            <div className={styles.gridSkeleton}>
              {Array.from({ length: 8 }).map((_, index) => (
                <article key={index} className={styles.productSkeleton}>
                  <span />
                  <span />
                  <span />
                  <span />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className={styles.skeleton}
          style={{
            width: `${100 - index * 12}%`,
            height: index === 0 ? "1.75rem" : "1rem",
          }}
        />
      ))}
    </div>
  );
}

import styles from "./Feedback.module.scss";

type SkeletonProps = {
  lines?: number;
  variant?: "default" | "page";
};

export function Skeleton({ lines = 3, variant = "default" }: SkeletonProps) {
  if (variant === "page") {
    return (
      <section className={styles.pageSkeleton} aria-hidden="true">
        <div className={styles.skeletonTopbar}>
          <span className={styles.skeletonLogo} />
          <div className={styles.skeletonNav}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonHero}>
            <div className={styles.skeletonHeroText}>
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className={styles.skeletonHeroImage} />
          </div>

          <div className={styles.skeletonContent}>
            <aside className={styles.skeletonSidebar}>
              <span />
              <span />
              <span />
              <span />
            </aside>

            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, index) => (
                <article className={styles.skeletonCard} key={index}>
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
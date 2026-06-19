import styles from "./product-detail.module.scss";

export default function Loading() {
  return (
    <main className={styles.page}>
      <div className={styles.breadcrumbWrap}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span>Loading product...</span>
        </nav>
      </div>

      <div className={styles.inner}>
        <section className={styles.productShell}>
          <div className={styles.galleryCard}>
            <div className={styles.detailSkeletonMedia} />
          </div>

          <aside className={styles.summary}>
            <div className={styles.detailSkeletonLine} />
            <div className={styles.detailSkeletonTitle} />
            <div className={styles.detailSkeletonLine} />
            <div className={styles.detailSkeletonLineShort} />
            <div className={styles.detailSkeletonActions} />
          </aside>
        </section>
      </div>
    </main>
  );
}

import styles from "./RouteSkeleton.module.scss";

export function RouteSkeleton() {
  return (
    <div className={styles.shell} aria-hidden="true">
      <div className={styles.panel}>
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.block} />
      </div>
    </div>
  );
}

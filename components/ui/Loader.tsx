import styles from "./Feedback.module.scss";

export function Loader() {
  return <span className={styles.loader} aria-label="Loading" role="status" />;
}

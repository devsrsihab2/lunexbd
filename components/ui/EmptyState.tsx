import { Button } from "./Button";
import styles from "./Feedback.module.scss";

export function EmptyState({ title, message, actionHref, actionLabel }: { title: string; message: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className={styles.box}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{message}</p>
      {actionHref && actionLabel ? <Button href={actionHref}>{actionLabel}</Button> : null}
    </div>
  );
}

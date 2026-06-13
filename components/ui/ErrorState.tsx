import { Button } from "./Button";
import styles from "./Feedback.module.scss";

export function ErrorState({ message = "Something went wrong.", retryHref }: { message?: string; retryHref?: string }) {
  return (
    <div className={styles.box} role="alert">
      <h2 className={styles.title}>We could not load this section</h2>
      <p className={styles.text}>{message}</p>
      {retryHref ? <Button href={retryHref} variant="secondary">Retry</Button> : null}
    </div>
  );
}

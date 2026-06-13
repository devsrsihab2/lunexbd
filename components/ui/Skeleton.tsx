import styles from "./Feedback.module.scss";

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} className={styles.skeleton} style={{ width: `${100 - index * 12}%`, height: index === 0 ? "1.75rem" : "1rem" }} />
      ))}
    </div>
  );
}

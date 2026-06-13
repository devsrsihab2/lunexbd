import styles from "./SectionHeader.module.scss";

export function SectionHeader({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <header className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {text ? <p className={styles.text}>{text}</p> : null}
      </div>
      {action}
    </header>
  );
}

import styles from "./Form.module.scss";

type Props = {
  label: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, id, ...props }: Props) {
  const inputId = id || props.name || label;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <textarea className={styles.control} id={inputId} aria-invalid={Boolean(error)} {...props} />
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
